import { test } from "node:test";
import assert from "node:assert/strict";
import { getWriting } from "../src/lib/content";

test("content integrations tolerate outages and validate external input", async () => {
  const originalFetch = globalThis.fetch;
  const originalProfile = process.env.MEDIUM_PROFILE_URL;
  try {
    delete process.env.MEDIUM_PROFILE_URL;
    assert.deepEqual(await getWriting(), { url: null, articles: [] });
    process.env.MEDIUM_PROFILE_URL = "https://medium.com.evil.example/@someone";
    assert.deepEqual(await getWriting(), { url: null, articles: [] });
    globalThis.fetch = async () => {
      throw new Error("Offline");
    };
    process.env.MEDIUM_PROFILE_URL = "https://medium.com/@example";
    assert.deepEqual(await getWriting(), {
      url: "https://medium.com/@example",
      articles: [],
    });
    globalThis.fetch = async () =>
      new Response(
        '<rss version="2.0"><channel><title>Test</title><item><title>A real article</title><link>https://medium.com/@example/story</link><pubDate>Tue, 03 Nov 2026 00:00:00 GMT</pubDate></item><item><title>Unsafe link</title><link>javascript:alert(1)</link></item></channel></rss>',
      );
    const writing = await getWriting();
    assert.equal(writing.articles.length, 1);
    assert.equal(writing.articles[0].title, "A real article");
    assert.equal(writing.articles[0].date, "Nov 2026");
    globalThis.fetch = async () => new Response("invalid xml");
    assert.equal((await getWriting()).articles.length, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalProfile === undefined) delete process.env.MEDIUM_PROFILE_URL;
    else process.env.MEDIUM_PROFILE_URL = originalProfile;
  }
});
