import Parser from "rss-parser";
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
