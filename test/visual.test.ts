import { expect, test } from "bun:test";
import { renderVisualHtml } from "../src/visual";
import type { SiteGraph } from "../src/graph";
const graph: SiteGraph={baseDomain:"x",startUrl:"https://x/",generatedAt:"x",crawlMeta:{maxDepth:null,maxPages:null,durationMs:0,pageCount:2,errorCount:0},nodes:{"https://x/":{url:"https://x/",path:"/",depth:0,status:200,contentType:"text/html",title:null,discoveredAt:"x",parents:[],children:["https://x/a"],error:null},"https://x/a":{url:"https://x/a",path:"/a",depth:1,status:200,contentType:"text/html",title:null,discoveredAt:"x",parents:["https://x/","https://x/b"],children:[],error:null}}};
test("visual is self-contained and embeds nodes",()=>{const html=renderVisualHtml(graph);expect(html).toContain('sitemap-data');expect(html).toContain('https://x/a');expect(html).toContain('multi');expect(html).not.toContain('http://');});
