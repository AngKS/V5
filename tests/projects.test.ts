import { test } from "node:test";
import assert from "node:assert/strict";
import {
  rankProjects,
  paginateProjects,
  fetchRankedProjects,
  type Project,
} from "../src/lib/projects";
const project = (repo: string, stars: number, activity: string): Project => ({
  repo,
  stars,
  activity,
  activitySource: "commit",
  url: `https://github.com/AngKS/${repo}`,
  description: "Example",
  language: "TypeScript",
});
test("stars take precedence, then latest commit, then name for stable pagination", () => {
  const input = [
    project("old-popular", 10, "2020-01-01"),
    project("new", 1, "2026-01-01"),
    project("older", 1, "2025-01-01"),
    project("a", 1, "2026-01-01"),
  ];
  const ranked = rankProjects(input);
  assert.deepEqual(
    ranked.map((p) => p.repo),
    ["old-popular", "a", "new", "older"],
  );
  assert.equal(input[0].repo, "old-popular");
  assert.deepEqual(
    paginateProjects(ranked, 1, 3).items.map((p) => p.repo),
    ["older"],
  );
  assert.equal(paginateProjects([], 0, 3).total, 0);
  assert.equal(paginateProjects(ranked, 99, 3).items.length, 0);
});
test("catalog filters forks and archives, uses commit time instead of push time and marks fallback", async () => {
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async (input) => {
      const url = String(input);
      if (url.includes("/users/"))
        return Response.json([
          {
            name: "older-push",
            size: 1,
            stargazers_count: 2,
            pushed_at: "2020-01-01",
            language: "Python",
          },
          {
            name: "recent-push",
            size: 1,
            stargazers_count: 2,
            pushed_at: "2026-01-01",
          },
          {
            name: "fallback",
            size: 1,
            stargazers_count: 0,
            pushed_at: "2025-01-01",
          },
          { name: "fork", fork: true, size: 1 },
          { name: "archive", archived: true, size: 1 },
          { name: "empty", size: 0 },
        ]);
      if (url.includes("/fallback/")) return new Response("", { status: 403 });
      return Response.json([
        {
          commit: {
            committer: {
              date: url.includes("/older-push/") ? "2026-02-01" : "2024-01-01",
            },
          },
        },
      ]);
    };
    const ranked = await fetchRankedProjects();
    assert.deepEqual(
      ranked.map((p) => p.repo),
      ["older-push", "recent-push", "fallback"],
    );
    assert.equal(ranked[0].activitySource, "commit");
    assert.equal(ranked[2].activitySource, "push");
    assert.equal(paginateProjects(ranked, 0, 3).approximate, true);
    globalThis.fetch = async () => new Response("", { status: 503 });
    await assert.rejects(fetchRankedProjects());
  } finally {
    globalThis.fetch = previous;
  }
});
