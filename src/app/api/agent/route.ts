import { agentResources } from "@/content/agent-info";
import { site } from "@/content/site";
import { getWriting } from "@/lib/content";

export async function GET(request: Request) {
  const resource = new URL(request.url).searchParams.get("resource");
  let data: unknown;
  if (!resource) {
    data = {
      schemaVersion: 1,
      owner: "Kah Shin Ang",
      website: site.url,
      scope:
        "Public portfolio information only. No private data, terminal history, or internal AI instructions.",
      resources: Object.keys(agentResources)
        .concat("writing")
        .map((name) => ({
          name,
          url: `${site.url}/api/agent?resource=${name}`,
        })),
      projects: {
        url: `${site.url}/api/projects?page=0&pageSize=3`,
        pagination: "Zero-based page; pageSize must be 1 or 3.",
        sort: "Stars descending, then latest default-branch commit; push date fallback is labeled.",
      },
    };
  } else if (resource === "writing") {
    const writing = await getWriting();
    data = {
      ...writing,
      status: !writing.url
        ? "not_configured"
        : writing.articles.length
          ? "available"
          : "empty_or_unavailable",
      source: `${site.url}/#writing`,
    };
  } else if (Object.hasOwn(agentResources, resource)) {
    data = agentResources[resource as keyof typeof agentResources];
  } else {
    return Response.json(
      {
        error: "Unknown resource",
        available: Object.keys(agentResources).concat("writing"),
      },
      { status: 400 },
    );
  }
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
