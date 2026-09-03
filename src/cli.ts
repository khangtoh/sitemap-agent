import { crawl } from "./crawl"; import { crawlExitCode, printRunSummary, readSitemapJson, writeSitemapJson } from "./output"; import { renderVisualHtml } from "./visual";
const help=[
  "Usage: sitemap-agent crawl <domain-or-url> [options]",
  "       sitemap-agent render <sitemap.json> [--out path]",
  "",
  "Crawl options                                      [default]",
  "  --max-depth n    link-hops from the start page   [unlimited]",
  "  --max-pages n    hard cap on pages fetched       [unlimited]",
  "  --concurrency n  pages fetched in parallel       [5]",
  "  --delay-ms n     minimum gap between requests    [200]",
  "  --include-query  keep utm_*/fbclid/gclid params  [off]",
  "  --output path    where to write the graph        [./sitemap.json]",
  "  --render         also write visual.html there    [off]",
  "  --resume path    continue from a checkpoint      [off]",
  "",
  "Render options",
  "  --out path       where to write the HTML         [visual.html]",
  "",
  "CLI flags override .sitemaprc.json, which overrides defaults.",
  "Exit codes: 0 clean, 1 pages errored, 64 usage error.",
  "Full guide: docs/USAGE.md",
].join("\n");
export async function runCli(args:string[]):Promise<number>{if(!args.length||args.includes("--help")){console.log(help);return 0}const [command,target,...rest]=args;if(!target){console.error(help);return 64}const flags:Record<string,string|boolean>={};for(let i=0;i<rest.length;i+=1)if(rest[i].startsWith("--"))flags[rest[i].slice(2)]=rest[i+1]?.startsWith("--")||!rest[i+1]?true:rest[++i];if(command==="render"){const graph=await readSitemapJson(target);await Bun.write(String(flags.out??"visual.html"),renderVisualHtml(graph));return 0}if(command!=="crawl"){console.error(help);return 64}const config=await Bun.file(".sitemaprc.json").json().catch(()=>({})) as Record<string,unknown>;const option=(key:string)=>flags[key]??config[key];const graph=await crawl(target.includes("://")?target:`https://${target}`,{maxDepth:parseLimit(option("max-depth")),maxPages:parseLimit(option("max-pages")),concurrency:parseLimit(option("concurrency")),delayMs:parseLimit(option("delay-ms")),includeQuery:Boolean(option("include-query")),resumePath:typeof option("resume")==="string" ? String(option("resume")) : undefined});const out=String(option("output")??"./sitemap.json");await writeSitemapJson(graph,out);if(option("render")){const slash=out.lastIndexOf("/");await Bun.write(`${slash>=0?out.slice(0,slash+1):""}visual.html`,renderVisualHtml(graph))}printRunSummary(graph);return crawlExitCode(graph)}export function parseLimit(value:unknown):number|undefined{if(typeof value==="number")return Number.isInteger(value)&&value>=0?value:undefined;return typeof value==="string"&&/^\d+$/.test(value)?Number(value):undefined}
