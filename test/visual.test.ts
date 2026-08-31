import { expect, test } from "bun:test";
import { buildTreeHtml, renderVisualHtml } from "../src/visual";
import type { SiteGraph } from "../src/graph";
const graph: SiteGraph={baseDomain:"x",startUrl:"https://x/",generatedAt:"x",crawlMeta:{maxDepth:null,maxPages:null,durationMs:0,pageCount:2,errorCount:0},nodes:{"https://x/":{url:"https://x/",path:"/",depth:0,status:200,contentType:"text/html",title:null,discoveredAt:"x",parents:[],children:["https://x/a"],error:null},"https://x/a":{url:"https://x/a",path:"/a",depth:1,status:200,contentType:"text/html",title:null,discoveredAt:"x",parents:["https://x/","https://x/b"],children:[],error:null}}};
test("visual is self-contained and embeds nodes",()=>{const html=renderVisualHtml(graph);expect(html).toContain('sitemap-data');expect(html).toContain('https://x/a');expect(html).toContain('multi');expect(html).not.toContain('http://');});

test("filter keeps matching nodes and the ancestors that reach them",()=>{
  const site: SiteGraph={...graph,nodes:{...graph.nodes,"https://x/":{...graph.nodes["https://x/"],children:["https://x/a"]},"https://x/a":{...graph.nodes["https://x/a"],children:["https://x/a/deep"]},"https://x/a/deep":{url:"https://x/a/deep",path:"/a/deep",depth:2,status:200,contentType:"text/html",title:null,discoveredAt:"x",parents:["https://x/a"],children:[],error:null}}};
  const all=buildTreeHtml(site,"");
  expect(all).toContain("%2Fa%2Fdeep");
  const filtered=buildTreeHtml(site,"deep");
  // The leaf survives, its ancestors survive as context, and they are faded.
  expect(filtered).toContain("%2Fa%2Fdeep");
  expect(filtered).toContain('data-u="https%3A%2F%2Fx%2Fa"');
  expect(filtered).toContain("faded");
  // A query matching nothing collapses to an empty tree rather than the root.
  expect(buildTreeHtml(site,"nosuchpath")).toBe("<ul></ul>");
});

test("embedded tree builder is plain JS with a stable call name",()=>{
  const html=renderVisualHtml(graph);
  expect(html).toContain("const buildTreeHtml = ");
  expect(html).toContain("buildTreeHtml(g,filter.value)");
  expect(buildTreeHtml.toString()).not.toContain("SiteGraph");
});
