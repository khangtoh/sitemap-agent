import { afterEach, expect, mock, test } from "bun:test";
import { crawl } from "../src/crawl";
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
test("crawl builds a BFS graph with shared children and limits", async () => {
  const pages: Record<string, string> = { "https://example.com/robots.txt": "", "https://example.com/": '<a href="/a">a</a><a href="/b">b</a>', "https://example.com/a": '<a href="/shared">s</a>', "https://example.com/b": '<a href="/shared">s</a>', "https://example.com/shared": "<title>Shared</title>" };
  globalThis.fetch = mock(async (input: string | URL) => new Response(pages[String(input)] ?? "missing", { status: pages[String(input)] === undefined ? 404 : 200, headers: { "content-type": String(input).endsWith("robots.txt") ? "text/plain" : "text/html" } })) as unknown as typeof fetch;
  const graph = await crawl("https://example.com", { delayMs: 0 });
  expect(Object.keys(graph.nodes)).toHaveLength(4);
  expect(graph.nodes["https://example.com/shared"].parents.sort()).toEqual(["https://example.com/a", "https://example.com/b"]);
  const limited = await crawl("https://example.com", { delayMs: 0, maxDepth: 1 });
  expect(Object.keys(limited.nodes)).toHaveLength(3);
});
test("crawl resumes a checkpoint without refetching visited URLs", async () => {
  const checkpoint = { graph: { baseDomain: "example.com", startUrl: "https://example.com/", generatedAt: new Date().toISOString(), crawlMeta: { maxDepth: null, maxPages: null, durationMs: 0, pageCount: 1, errorCount: 0 }, nodes: { "https://example.com/": { url: "https://example.com/", path: "/", depth: 0, status: 200, contentType: "text/html", title: null, discoveredAt: new Date().toISOString(), parents: [], children: ["https://example.com/a"], error: null } } }, queue: [{ url: "https://example.com/a", depth: 1, parent: "https://example.com/" }] };
  globalThis.fetch = mock(async (input: string | URL) => new Response(String(input).endsWith("robots.txt") ? "" : "<title>A</title>", { headers: { "content-type": String(input).endsWith("robots.txt") ? "text/plain" : "text/html" } })) as unknown as typeof fetch;
  const graph = await crawl("https://example.com", { resume: checkpoint, delayMs: 0 });
  expect(Object.keys(graph.nodes).sort()).toEqual(["https://example.com/", "https://example.com/a"]);
  expect(globalThis.fetch).toHaveBeenCalledTimes(2);
});
