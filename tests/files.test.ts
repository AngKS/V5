import { test } from "node:test";
import assert from "node:assert/strict";
import { blobFileUrl } from "../src/lib/files";
import { GET } from "../src/app/files/[name]/route";

test("file URLs accept only a public Blob store origin", () => {
  assert.equal(
    blobFileUrl("resume.pdf", "https://example.public.blob.vercel-storage.com"),
    "https://example.public.blob.vercel-storage.com/portfolio/resume.pdf",
  );
  for (const url of [
    "https://evil.example",
    "http://example.public.blob.vercel-storage.com",
    "https://example.public.blob.vercel-storage.com/path",
    "https://example.public.blob.vercel-storage.com.evil.example",
  ])
    assert.throws(() => blobFileUrl("resume.pdf", url));
});

test("file routes use safe local fallbacks and read configured Blob text", async () => {
  const old = process.env.PORTFOLIO_BLOB_URL;
  const originalFetch = globalThis.fetch;
  const get = (name: string) =>
    GET(new Request("http://localhost/files/" + name), {
      params: Promise.resolve({ name }),
    });
  try {
    delete process.env.PORTFOLIO_BLOB_URL;
    assert.equal((await get(".env")).status, 404);
    assert.match(
      (await get("resume.pdf")).headers.get("location")!,
      /drive.google.com/,
    );
    assert.match(await (await get("hello.txt")).text(), /Kah Shin/);
    globalThis.fetch = async () => new Response(null, { status: 200 });
    process.env.PORTFOLIO_BLOB_URL =
      "https://example.public.blob.vercel-storage.com";
    assert.match(
      (await get("resume.pdf")).headers.get("location")!,
      /portfolio\/resume.pdf/,
    );
    globalThis.fetch = async () => new Response("Published hello");
    assert.equal(await (await get("hello.txt")).text(), "Published hello");
    globalThis.fetch = async () => new Response("Missing", { status: 404 });
    assert.match(await (await get("hello.txt")).text(), /Kah Shin/);
    assert.match(
      (await get("resume.pdf")).headers.get("location")!,
      /drive.google.com/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (old === undefined) delete process.env.PORTFOLIO_BLOB_URL;
    else process.env.PORTFOLIO_BLOB_URL = old;
  }
});
