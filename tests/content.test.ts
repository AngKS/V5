import { test } from "node:test";
import assert from "node:assert/strict";
import { getWriting, parseWritingFeed } from "../src/lib/content";

test("Medium previews extract covers and readable, bounded excerpts from RSS", async () => {
  const articles =
    await parseWritingFeed(`<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>Stories</title>
    <item><title>Building &amp; learning</title><link>https://medium.com/@example/building</link><content:encoded><![CDATA[
      <h3>Building &amp; learning</h3><img src="https://example.com/pixel" width="1" height="1" />
      <img src="javascript:alert(1)" /><img src='https://cdn-images-1.medium.com/cover.jpg?a=1&amp;b=2' />
      <p>A <strong>small</strong> experiment &amp; a useful lesson.</p>
    ]]></content:encoded></item>
    <item><title>No cover</title><link>https://medium.com/@example/plain</link><description><![CDATA[<p>${"A longer observation about building things. ".repeat(12)}</p>]]></description></item>
    <item><title>Duplicate</title><link>https://medium.com/@example/plain</link></item>
    <item><title>Unsafe</title><link>javascript:alert(1)</link></item>
    <item><title>Credentials</title><link>https://user:password@example.com/story</link></item>
    </channel></rss>`);
  assert.equal(articles.length, 2);
  assert.equal(
    articles[0].cover,
    "https://cdn-images-1.medium.com/cover.jpg?a=1&b=2",
  );
  assert.equal(articles[0].excerpt, "A small experiment & a useful lesson.");
  assert.equal(articles[0].date, "On Medium");
  assert.equal(articles[1].cover, null);
  assert.ok(articles[1].excerpt.length <= 201);
  assert.ok(articles[1].excerpt.endsWith("…"));
  assert.ok(!articles[1].excerpt.includes("<p>"));
});

test("Medium carousel includes more than three stories, bounded to ten", async () => {
  const xml = `<rss version="2.0"><channel><title>Stories</title>${Array.from({ length: 12 }, (_, index) => `<item><title>Story ${index}</title><link>https://medium.com/@example/story-${index}</link></item>`).join("")}</channel></rss>`;
  const articles = await parseWritingFeed(xml);
  assert.equal(articles.length, 10);
  assert.equal(articles[9].title, "Story 9");
  assert.equal(articles[9].excerpt, "");
});

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
