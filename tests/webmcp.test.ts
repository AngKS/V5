import test from "node:test";
import assert from "node:assert/strict";
import { portfolioTools, registerPortfolioTools } from "../src/lib/webmcp";

test("portfolio tools validate arguments and only read bounded public endpoints", async () => {
  const calls: string[] = [];
  const tools = portfolioTools((async (url, init) => {
    calls.push(String(url));
    assert.equal(init?.credentials, "omit");
    return Response.json({ public: true });
  }) as typeof fetch);
  assert.equal(tools.length, 6);
  assert.ok(tools.every((tool) => tool.annotations.readOnlyHint));
  for (const tool of tools) await tool.execute({});
  assert.deepEqual(calls, [
    "/api/agent?resource=profile",
    "/api/agent?resource=experience",
    "/api/agent?resource=education",
    "/api/agent?resource=contact",
    "/api/agent?resource=writing",
    "/api/projects?page=0&pageSize=3",
  ]);
  const projects = tools.at(-1)!;
  for (const args of [
    { page: -1 },
    { page: 2.5 },
    { page: 2001 },
    { page: "1" },
    { url: "https://example.com" },
  ]) {
    assert.ok("error" in ((await projects.execute(args)) as object));
  }
  assert.equal(calls.length, 6);
});

test("registration cleanup aborts every tool and API failures return structured errors", async () => {
  const signals: AbortSignal[] = [];
  const dispose = registerPortfolioTools({
    registerTool: (_tool, options) => {
      signals.push(options.signal);
    },
  });
  assert.equal(signals.length, 6);
  assert.ok(signals.every((signal) => !signal.aborted));
  dispose();
  assert.ok(signals.every((signal) => signal.aborted));
  const tools = portfolioTools(
    (async () => new Response(null, { status: 503 })) as typeof fetch,
  );
  assert.deepEqual(await tools[0].execute({}), {
    error:
      "Portfolio data is temporarily unavailable. Retry later or consult the public website.",
    status: 503,
  });
});
