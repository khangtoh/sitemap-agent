import { expect, test } from "bun:test";
import { readSitemapJson, writeSitemapJson } from "../src/output";
import type { SiteGraph } from "../src/graph";
const graph: SiteGraph = { baseDomain:"example.com", startUrl:"https://example.com/", generatedAt:new Date().toISOString(), crawlMeta:{maxDepth:null,maxPages:null,durationMs:0,pageCount:0,errorCount:0},nodes:{} };
test("writes and reads sitemap JSON", async () => { const path=`/tmp/sitemap-agent-${crypto.randomUUID()}.json`; await writeSitemapJson(graph,path); expect(await readSitemapJson(path)).toEqual(graph); });
