import { expect, test } from "bun:test";
import { deserializeSiteGraph, serializeSiteGraph, type SiteGraph } from "../src/graph";
const graph: SiteGraph = { baseDomain: "example.com", startUrl: "https://example.com/", generatedAt: "2026-08-30T00:00:00.000Z", crawlMeta: { maxDepth: null, maxPages: null, durationMs: 1, pageCount: 1, errorCount: 0 }, nodes: { "https://example.com/": { url: "https://example.com/", path: "/", depth: 0, status: 200, contentType: "text/html", title: "Home", discoveredAt: "2026-08-30T00:00:00.000Z", parents: [], children: [], error: null } } };
test("graph serializes stably and round-trips", () => expect(deserializeSiteGraph(serializeSiteGraph(graph))).toEqual(graph));
test("graph rejects malformed data", () => expect(() => deserializeSiteGraph('{"nodes":{}}')).toThrow("required"));
