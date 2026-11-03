import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { terminalInstructions } from "@/content/terminal-knowledge";
import { validateQuestion } from "@/lib/terminal";

export const runtime = "nodejs";
export const maxDuration = 30;
// A small per-instance circuit breaker, not a distributed rate limiter.
let windowStart = 0;
let requests = 0;
const headers = {
  "Cache-Control": "no-store",
  "Content-Type": "text/plain; charset=utf-8",
};
const fail = (text: string, status: number) =>
  new Response(text, { status, headers });

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return fail("This terminal only accepts questions from its own site.", 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return fail("Send a JSON question.", 415);
  // Limit bytes while reading, including chunked requests without Content-Length.
  let body = "";
  try {
    const reader = request.body?.getReader();
    if (!reader) return fail("A question is required.", 400);
    const decoder = new TextDecoder();
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 4096) {
        await reader.cancel();
        return fail("Question too long.", 413);
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  } catch {
    return fail("Could not read that question.", 400);
  }
  let question: string | null;
  try {
    question = validateQuestion(JSON.parse(body));
  } catch {
    return fail("Invalid question.", 400);
  }
  if (!question) return fail("Ask a question of 1–600 characters.", 400);
  if (!process.env.OPENAI_API_KEY)
    return fail(
      "The Q&A uplink isn't connected yet. Kah Shin is setting it up. Meanwhile, try cat hello.txt or cat resume.pdf.",
      503,
    );
  if (Date.now() - windowStart > 60_000) {
    windowStart = Date.now();
    requests = 0;
  }
  if (++requests > 20)
    return fail("The uplink needs a breather. Try again in a minute.", 429);

  const abort = new AbortController();
  const signal = AbortSignal.any([
    request.signal,
    abort.signal,
    AbortSignal.timeout(25_000),
  ]);
  const model = process.env.OPENAI_MODEL || "gpt-5-nano";
  const result = streamText({
    model: openai(model),
    system: terminalInstructions,
    prompt: question,
    maxOutputTokens: 1200,
    maxRetries: 0,
    // Errors are handled below; do not log provider payloads or visitor questions.
    onError: () => {},
    abortSignal: signal,
    providerOptions: {
      openai: {
        store: false,
        reasoningSummary: null,
        ...(model.startsWith("gpt-5-nano")
          ? { reasoningEffort: "minimal" }
          : {}),
      },
    },
  });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let hasText = false;
      let failed = false;
      try {
        for await (const part of result.stream) {
          if (part.type === "text-delta") {
            hasText = true;
            controller.enqueue(encoder.encode(part.text));
          }
          if (part.type === "error" || part.type === "abort") {
            failed = true;
            break;
          }
        }
        if (failed || !hasText)
          controller.enqueue(
            encoder.encode(
              "\n[Uplink interrupted. Please try again shortly. You can also reach Kah Shin via the contact links.]",
            ),
          );
        controller.close();
      } catch {
        if (!abort.signal.aborted) {
          controller.enqueue(
            encoder.encode("\n[Uplink interrupted. Please try again shortly.]"),
          );
          controller.close();
        }
      }
    },
    cancel() {
      abort.abort();
    },
  });
  return new Response(stream, { headers });
}
