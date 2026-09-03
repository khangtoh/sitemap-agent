import { expect, test } from "bun:test";
import { parseLimit, runCli } from "../src/cli"; import { writeSitemapJson } from "../src/output"; import type { SiteGraph } from "../src/graph";
const graph:SiteGraph={baseDomain:"x",startUrl:"https://x/",generatedAt:"x",crawlMeta:{maxDepth:null,maxPages:null,durationMs:0,pageCount:0,errorCount:0},nodes:{}};
test("render CLI reads saved graph without crawling",async()=>{const id=crypto.randomUUID(),input=`/tmp/${id}.json`,out=`/tmp/${id}.html`;await writeSitemapJson(graph,input);expect(await runCli(["render",input,"--out",out])).toBe(0);expect(await Bun.file(out).text()).toContain("sitemap-data")});
test("CLI help and bad commands use documented exit codes",async()=>{expect(await runCli(["--help"])).toBe(0);expect(await runCli(["nope","x"])).toBe(64)});
test("numeric limits are accepted as JSON numbers and as strings",()=>{
  // .sitemaprc.json holds real JSON numbers; flags always arrive as strings.
  // Rejecting numbers made config limits silently do nothing.
  expect(parseLimit(3)).toBe(3);
  expect(parseLimit("3")).toBe(3);
  expect(parseLimit(0)).toBe(0);
  expect(parseLimit(-1)).toBeUndefined();
  expect(parseLimit(1.5)).toBeUndefined();
  expect(parseLimit("abc")).toBeUndefined();
  expect(parseLimit(undefined)).toBeUndefined();
});
