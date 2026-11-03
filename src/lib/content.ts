import Parser from "rss-parser";
import { featuredProjects } from "@/content/profile";

export async function getProjects() {
  return Promise.all(
    featuredProjects.map(async (project) => {
      const fallback = {
        ...project,
        url: `https://github.com/AngKS/${project.repo}`,
        language: null as string | null,
      };
      try {
        const response = await fetch(
          `https://api.github.com/repos/AngKS/${project.repo}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              ...(process.env.GITHUB_TOKEN
                ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
                : {}),
            },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(5000),
          },
        );
        if (!response.ok) return fallback;
        const data = await response.json();
        return {
          ...fallback,
          language: typeof data.language === "string" ? data.language : null,
          description:
            typeof data.description === "string" && data.description
              ? data.description
              : fallback.description,
        };
      } catch {
        return fallback;
      }
    }),
  );
}
export type Article = { title: string; url: string; date: string };
export async function getWriting(): Promise<{
  url: string | null;
  articles: Article[];
}> {
  const configured = process.env.MEDIUM_PROFILE_URL;
  if (!configured) return { url: null, articles: [] };
  let profile: URL;
  try {
    profile = new URL(configured);
    if (
      profile.protocol !== "https:" ||
      (profile.hostname !== "medium.com" &&
        !profile.hostname.endsWith(".medium.com")) ||
      profile.username ||
      profile.password ||
      profile.port
    )
      throw new Error("Invalid Medium URL");
  } catch {
    return { url: null, articles: [] };
  }
  const url = profile.origin + profile.pathname;
  const feedUrl =
    profile.hostname === "medium.com"
      ? `${profile.origin}/feed${profile.pathname.replace(/\/$/, "")}`
      : `${profile.origin}/feed`;
  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
      redirect: "error",
    });
    if (!response.ok) throw new Error("Feed unavailable");
    const feed = await new Parser().parseString(await response.text());
    const articles = feed.items
      .flatMap((item) => {
        if (!item.title || !item.link) return [];
        try {
          if (new URL(item.link).protocol !== "https:") return [];
        } catch {
          return [];
        }
        return [
          {
            title: item.title,
            url: item.link,
            date:
              item.isoDate && !Number.isNaN(Date.parse(item.isoDate))
                ? new Date(item.isoDate).toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  })
                : "On Medium",
          },
        ];
      })
      .slice(0, 3);
    return { url, articles };
  } catch {
    return { url, articles: [] };
  }
}
