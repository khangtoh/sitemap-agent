import { deserializeSiteGraph, serializeSiteGraph, type SiteGraph } from "../graph";
import type { CrawlCheckpoint } from "../crawl";
export async function writeSitemapJson(graph: SiteGraph, outPath = "./sitemap.json"): Promise<void> { await ensureParent(outPath); await Bun.write(outPath, serializeSiteGraph(graph)); }
export async function writeCheckpoint(checkpoint: CrawlCheckpoint, outPath: string): Promise<void> { await ensureParent(outPath); await Bun.write(outPath, JSON.stringify(checkpoint)); }
export function printRunSummary(graph: SiteGraph): void { const failed = Object.values(graph.nodes).filter((node) => node.error || (node.status !== null && node.status >= 400)); console.log(`Pages: ${graph.crawlMeta.pageCount}\nMax depth: ${Math.max(0, ...Object.values(graph.nodes).map((node) => node.depth))}\nErrors: ${graph.crawlMeta.errorCount}\nDuration: ${graph.crawlMeta.durationMs}ms${failed.length ? `\nFailed: ${failed.map((node) => node.url).join(", ")}` : ""}`); }
export function crawlExitCode(graph: SiteGraph): number { return graph.crawlMeta.errorCount ? 1 : 0; }
export async function readSitemapJson(path: string): Promise<SiteGraph> { return deserializeSiteGraph(await Bun.file(path).text()); }
async function ensureParent(path: string): Promise<void> { const slash = path.lastIndexOf("/"); if (slash > 0) await Bun.$`mkdir -p ${path.slice(0, slash)}`.quiet(); }
