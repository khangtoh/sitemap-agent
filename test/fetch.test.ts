import { afterEach, describe, expect, mock, test } from "bun:test";
import { extractLinks, extractPageMeta, fetchPage } from "../src/fetch";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

describe("HTML extraction", () => {
  const html = `<!doctype html><title> A page </title><link rel="stylesheet" href="/site.css"><link rel="canonical" href="/canonical"><a href="/relative#one">relative</a><a href="https://other.example/p?q=1">outside</a><a href="?page=2">query</a><a href="mailto:test@example.com">mail</a>`;

  test("extracts only anchors and resolves them without scope filtering", () => {
    expect(extractLinks(html, "https://example.com/docs/start")).toEqual([
      "https://example.com/relative#one",
      "https://other.example/p?q=1",
      "https://example.com/docs/start?page=2",
    ]);
  });

  test("extracts title and canonical URL as metadata", () => {
    expect(extractPageMeta(html, "https://example.com/docs/start")).toEqual({
      title: "A page",
      canonicalUrl: "https://example.com/canonical",
    });
  });
});

test("fetchPage records HTML content and the final redirect URL", async () => {
  globalThis.fetch = mock(async () => new Response("<title>ok</title>", {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  })) as unknown as typeof fetch;
  const result = await fetchPage("https://example.com/original", { retries: 0 });
  expect(result).toMatchObject({ url: "https://example.com/original", status: 200, ok: true, contentType: "text/html; charset=utf-8", html: "<title>ok</title>" });
});

test("fetchPage treats non-HTML and HTTP errors as leaves", async () => {
  globalThis.fetch = mock(async () => new Response("binary", { status: 404, headers: { "content-type": "application/pdf" } })) as unknown as typeof fetch;
  const result = await fetchPage("https://example.com/missing", { retries: 0 });
  expect(result).toEqual({ url: "https://example.com/missing", finalUrl: "https://example.com/missing", status: 404, contentType: "application/pdf", ok: false });
  expect(result.html).toBeUndefined();
});

test("fetchPage retries network errors then returns a non-throwing result", async () => {
  globalThis.fetch = mock(async () => { throw new Error("DNS failure"); }) as unknown as typeof fetch;
  const result = await fetchPage("https://example.com", { retries: 1, retryDelayMs: 0 });
  expect(result).toMatchObject({ url: "https://example.com", finalUrl: "https://example.com", status: 0, ok: false, error: "DNS failure" });
  expect(globalThis.fetch).toHaveBeenCalledTimes(2);
});
