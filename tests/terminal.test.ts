import { test } from "node:test";
import assert from "node:assert/strict";
import { runCommand, validateQuestion, MANUAL } from "../src/lib/terminal";
import { POST } from "../src/app/api/terminal/route";

test("virtual filesystem exposes only the three public files", () => {
  assert.deepEqual(runCommand("ls"), {
    kind: "text",
    text: "resume.pdf\nUSER_MANUAL.md\nhello.txt",
  });
  assert.deepEqual(runCommand("cat USER_MANUAL.md"), {
    kind: "file",
    name: "USER_MANUAL.md",
  });
  assert.equal(runCommand("cat resume.pdf").kind, "resume");
  assert.match(
    (runCommand("cat ../../.env") as { text: string }).text,
    /File not found/,
  );
  assert.match(
    (runCommand("cat hello.txt; ls") as { text: string }).text,
    /File not found/,
  );
});

test("commands preserve question case and reject empty or oversized questions", () => {
  assert.deepEqual(runCommand("qn   What is XAI?"), {
    kind: "question",
    question: "What is XAI?",
  });
  assert.equal(runCommand("qn").kind, "text");
  assert.equal(runCommand(`qn ${"a".repeat(601)}`).kind, "text");
  assert.deepEqual(runCommand("man"), runCommand("help"));
  for (const body of [
    null,
    {},
    { question: 10 },
    { question: " " },
    { question: "a".repeat(601) },
  ])
    assert.equal(validateQuestion(body), null);
});

function request(body: string, origin = "http://localhost:3005") {
  return new Request("http://localhost:3005/api/terminal", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body,
  });
}

test("API validates origin, request size and shape before any provider call", async () => {
  assert.equal(
    (await POST(request("{}", "https://other.example"))).status,
    403,
  );
  assert.equal((await POST(request("not JSON"))).status, 400);
  assert.equal(
    (await POST(request(JSON.stringify({ question: "a".repeat(601) })))).status,
    400,
  );
  assert.equal((await POST(request("x".repeat(4097)))).status, 413);
});

test("missing key returns a helpful offline response without a provider call", async () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const response = await POST(
      request(JSON.stringify({ question: "What does Kah Shin build?" })),
    );
    assert.equal(response.status, 503);
    assert.match(await response.text(), /isn't connected yet/);
  } finally {
    if (previous !== undefined) process.env.OPENAI_API_KEY = previous;
  }
});

test("SDK streams text with bounded, stateless requests and sanitizes provider failures", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const originalFetch = globalThis.fetch;
  process.env.OPENAI_API_KEY = "test-key-not-real";
  process.env.OPENAI_MODEL = "gpt-5-nano";
  let sent: Record<string, unknown> = {};
  try {
    globalThis.fetch = async (_url, init) => {
      sent = JSON.parse(init?.body as string);
      const events = [
        {
          type: "response.created",
          response: { id: "test", created_at: 1, model: "gpt-5-nano" },
        },
        {
          type: "response.output_item.added",
          output_index: 0,
          item: { type: "message", id: "msg" },
        },
        {
          type: "response.output_text.delta",
          item_id: "msg",
          delta: "Kah Shin explores computer vision.",
        },
        { type: "response.completed", response: {} },
      ];
      return new Response(
        events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join(""),
        { headers: { "content-type": "text/event-stream" } },
      );
    };
    const response = await POST(
      request(JSON.stringify({ question: "What does he explore?" })),
    );
    assert.equal(await response.text(), "Kah Shin explores computer vision.");
    assert.equal(sent.store, false);
    assert.equal(sent.max_output_tokens, 1200);
    assert.equal(sent.model, "gpt-5-nano");
    assert.equal(sent.tools, undefined);
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          error: {
            message: "SECRET upstream diagnostic",
            type: "invalid_request_error",
            code: "invalid_api_key",
          },
        }),
        { status: 401, headers: { "content-type": "application/json" } },
      );
    const failed = await POST(request(JSON.stringify({ question: "Hello?" })));
    const text = await failed.text();
    assert.match(text, /Uplink interrupted/);
    assert.doesNotMatch(text, /SECRET|test-key/);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
  }
});
