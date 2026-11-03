import { blobFileUrl, isPortfolioFile, LEGACY_RESUME } from "@/lib/files";
import { HELLO, MANUAL } from "@/lib/terminal";

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  if (!isPortfolioFile(name))
    return new Response("File not found", { status: 404 });
  let url: string | null;
  try {
    url = blobFileUrl(name);
  } catch {
    return new Response("File storage is not configured correctly.", {
      status: 503,
    });
  }
  if (name === "resume.pdf") {
    if (url) {
      try {
        const exists = await fetch(url, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
          next: { revalidate: 300 },
          redirect: "error",
        });
        if (exists.ok) return Response.redirect(url, 307);
      } catch {
        /* Keep the existing resume available until the PDF is uploaded. */
      }
    }
    return Response.redirect(LEGACY_RESUME, 307);
  }
  const fallback = name === "USER_MANUAL.md" ? MANUAL : HELLO;
  if (url) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 300 },
        redirect: "error",
      });
      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let text = "",
          size = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 64 * 1024) {
            await reader.cancel();
            throw new Error("Document too large");
          }
          text += decoder.decode(value, { stream: true });
        }
        return textResponse(text + decoder.decode());
      }
    } catch {
      /* Public instructions remain available during storage outages. */
    }
  }
  return textResponse(fallback);
}
function textResponse(text: string) {
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=60",
    },
  });
}
