import { serializeSiteGraph, type SiteGraph } from "../graph";

const STYLE = "body{font:14px system-ui;margin:1rem;display:grid;grid-template-columns:1fr 320px;gap:1rem}input{grid-column:1/3;padding:.5rem}ul{list-style:none;padding-left:1.2rem}.node{cursor:pointer;padding:2px}.bad{color:#b42318}.faded{opacity:.45}.multi{font-size:.75em;background:#eee;border-radius:8px;padding:1px 5px}aside{white-space:pre-wrap;border-left:1px solid #ddd;padding-left:1rem}";

/**
 * Build the `<ul>` tree for a graph, keeping any node whose path contains
 * `query` plus the ancestors needed to reach it (those render faded). An
 * empty query keeps everything.
 *
 * Self-contained on purpose: it is serialized into the generated HTML with
 * `toString()` and also imported directly by tests, so there is one
 * implementation rather than a copy per environment.
 */
export function buildTreeHtml(graph: SiteGraph, query: string): string {
  const q = query.toLowerCase();
  const seen = new Set<string>();
  function label(node: SiteGraph["nodes"][string]): string {
    return node.path === "/" ? "/" : node.path.split("/").filter(Boolean).pop() ?? "/";
  }
  function branch(url: string): string {
    const node = graph.nodes[url];
    if (!node || seen.has(url)) return "";
    seen.add(url);
    const kids = node.children.map(branch).filter(Boolean).join("");
    const hit = !q || node.path.toLowerCase().includes(q);
    if (!hit && !kids) { seen.delete(url); return ""; }
    const bad = node.error || !node.status || node.status < 200 || node.status >= 300;
    const more = Math.max(0, node.parents.length - 1);
    const classes = "node" + (bad ? " bad" : "") + (hit ? "" : " faded");
    return '<li><span class="' + classes + '" data-u="' + encodeURIComponent(url) + '">' + label(node) +
      (more ? ' <b class="multi">+' + more + " parent</b>" : "") + "</span>" +
      (kids ? "<ul>" + kids + "</ul>" : "") + "</li>";
  }
  return "<ul>" + branch(graph.startUrl) + "</ul>";
}

export function renderVisualHtml(graph: SiteGraph): string {
  const data = serializeSiteGraph(graph).replace(/<\/script/gi, "<\\/script");
  // Bound to a const under a fixed name so a bundler renaming the function
  // cannot break the call below.
  const script = `const buildTreeHtml = ${buildTreeHtml.toString()};
const g=JSON.parse(document.getElementById('sitemap-data').textContent),tree=document.getElementById('tree'),detail=document.getElementById('detail'),filter=document.getElementById('filter');
function draw(){tree.innerHTML=buildTreeHtml(g,filter.value);tree.querySelectorAll('.node').forEach(e=>e.onclick=()=>{detail.textContent=JSON.stringify(g.nodes[decodeURIComponent(e.dataset.u)],null,2);const ul=e.parentElement.querySelector(':scope>ul');if(ul)ul.hidden=!ul.hidden})}
filter.oninput=draw;draw()`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>Site map</title><style>${STYLE}</style></head><body><h1>Site map</h1><input id="filter" placeholder="Filter paths"><main id="tree"></main><aside id="detail">Select a page</aside><script id="sitemap-data" type="application/json">${data}</script><script>${script}</script></body></html>`;
}
