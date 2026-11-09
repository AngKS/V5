import Parser from "rss-parser";
export type Article = {
  title: string;
  url: string;
  date: string;
  excerpt: string;
  cover: string | null;
};

function safeHttpsUrl(value: string): string | null {
  try {
    const url = new URL(value.replace(/&amp;/g, "&"));
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function coverFromHtml(html: string): string | null {
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    // Ignore tracking pixels in syndicated content.
    if (/\b(?:width|height)\s*=\s*["']?1(?:["'\s>])/i.test(tag)) continue;
    const source = tag.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const url = source && safeHttpsUrl(source[1] ?? source[2] ?? source[3]);
    if (url) return url;
  }
  return null;
}

export async function parseWritingFeed(xml: string): Promise<Article[]> {
  const feed = await new Parser().parseString(xml);
  const seen = new Set<string>();
  return feed.items
    .flatMap((item) => {
      const url = item.link && safeHttpsUrl(item.link);
      if (!item.title || !url || seen.has(url)) return [];
      seen.add(url);
      const html = item["content:encoded"] || item.content || "";
      let excerpt = (
        item["content:encodedSnippet"] ||
        item.contentSnippet ||
        ""
      )
        .replace(/\s+/g, " ")
        .trim();
      if (excerpt.startsWith(item.title))
        excerpt = excerpt.slice(item.title.length).trim();
      if (excerpt.length > 200) {
        excerpt = `${excerpt
          .slice(0, 200)
          .replace(/\s+\S*$/, "")
          .trimEnd()}…`;
      }
      return [
        {
          title: item.title,
          url,
          date:
            item.isoDate && !Number.isNaN(Date.parse(item.isoDate))
              ? new Date(item.isoDate).toLocaleDateString("en-GB", {
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })
              : "On Medium",
          excerpt,
          cover: coverFromHtml(html),
        },
      ];
    })
    .slice(0, 10);
}
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
    const articles = await parseWritingFeed(await response.text());
    return { url, articles };
  } catch {
    return { url, articles: [] };
  }
}
