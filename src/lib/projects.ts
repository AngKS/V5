import { unstable_cache } from "next/cache";
export type Project = {
  repo: string;
  url: string;
  description: string;
  language: string | null;
  stars: number;
  activity: string | null;
  activitySource: "commit" | "push" | "none";
};
export type ProjectPage = {
  items: Project[];
  total: number;
  page: number;
  pageSize: number;
  approximate: boolean;
};
type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string | null;
  fork: boolean;
  private: boolean;
  archived: boolean;
  size: number;
};
async function github(path: string) {
  const response = await fetch(`https://api.github.com/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`GitHub unavailable (${response.status})`);
  return response.json();
}
export function rankProjects(items: Project[]) {
  return [...items].sort(
    (a, b) =>
      b.stars - a.stars ||
      (Date.parse(b.activity || "") || 0) -
        (Date.parse(a.activity || "") || 0) ||
      a.repo.localeCompare(b.repo),
  );
}
export function paginateProjects(
  items: Project[],
  page: number,
  pageSize: number,
): ProjectPage {
  return {
    items: items.slice(page * pageSize, (page + 1) * pageSize),
    total: items.length,
    page,
    pageSize,
    approximate: items.some((item) => item.activitySource === "push"),
  };
}
export async function fetchRankedProjects() {
  const repos: Repo[] = [];
  // Fetch the entire public catalog before ranking, not each GitHub page in isolation.
  for (let page = 1; ; page++) {
    const batch: Repo[] = await github(
      `users/AngKS/repos?type=owner&per_page=100&page=${page}`,
    );
    if (!Array.isArray(batch)) throw new Error("Invalid GitHub response");
    repos.push(
      ...batch.filter(
        (repo) =>
          !repo.fork && !repo.private && !repo.archived && repo.size > 0,
      ),
    );
    if (batch.length < 100) break;
    if (page >= 20)
      throw new Error("Repository catalog exceeds supported size");
  }
  const result: Project[] = [];
  let cursor = 0;
  // Bound concurrent requests; each commit response and the complete ranking are cached.
  await Promise.all(
    Array.from({ length: Math.min(4, repos.length) }, async () => {
      while (cursor < repos.length) {
        const repo = repos[cursor++];
        let activity = repo.pushed_at;
        let activitySource: Project["activitySource"] = activity
          ? "push"
          : "none";
        try {
          const commits = await github(
            `repos/AngKS/${encodeURIComponent(repo.name)}/commits?per_page=1`,
          );
          const date = commits[0]?.commit?.committer?.date;
          if (typeof date === "string" && Number.isFinite(Date.parse(date))) {
            activity = date;
            activitySource = "commit";
          }
        } catch {
          /* A rate-limited commit lookup falls back to explicitly labelled push time. */
        }
        result.push({
          repo: repo.name,
          url: `https://github.com/AngKS/${encodeURIComponent(repo.name)}`,
          description:
            repo.description ||
            "Explore the code, documentation, and latest changes on GitHub.",
          language: repo.language,
          stars: repo.stargazers_count,
          activity,
          activitySource,
        });
      }
    }),
  );
  return rankProjects(result);
}
export const getRankedProjects = unstable_cache(
  fetchRankedProjects,
  ["github-ranked-projects-v1"],
  { revalidate: 3600 },
);
