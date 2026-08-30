import { expect, test } from "bun:test";
import { runCli } from "../src/cli"; import { writeSitemapJson } from "../src/output"; import type { SiteGraph } from "../src/graph";
const graph:SiteGraph={baseDomain:"x",startUrl:"https://x/",generatedAt:"x",crawlMeta:{maxDepth:null,maxPages:null,durationMs:0,pageCount:0,errorCount:0},nodes:{}};
test("render CLI reads saved graph without crawling",async()=>{const id=crypto.randomUUID(),input=`/tmp/${id}.json`,out=`/tmp/${id}.html`;await writeSitemapJson(graph,input);expect(await runCli(["render",input,"--out",out])).toBe(0);expect(await Bun.file(out).text()).toContain("sitemap-data")});
test("CLI help and bad commands use documented exit codes",async()=>{expect(await runCli(["--help"])).toBe(0);expect(await runCli(["nope","x"])).toBe(64)});
