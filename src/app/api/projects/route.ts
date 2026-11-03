import { getRankedProjects, paginateProjects } from "@/lib/projects";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") ?? "0");
  const pageSize = Number(params.get("pageSize") ?? "3");
  if (
    !Number.isInteger(page) ||
    page < 0 ||
    page > 2000 ||
    ![1, 3].includes(pageSize)
  )
    return Response.json({ error: "Invalid pagination" }, { status: 400 });
  try {
    const projects = await getRankedProjects();
    return Response.json(paginateProjects(projects, page, pageSize), {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json(
      { error: "GitHub is taking a break. Please try again shortly." },
      { status: 503 },
    );
  }
}
