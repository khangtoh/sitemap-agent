import { canonicalize, fetchRobotsRules, isAllowedByRobots, isSameScope } from "../url";
import { extractLinks, extractPageMeta, fetchPage } from "../fetch";
import type { SiteGraph, SiteNode } from "../graph";

export interface CrawlOptions { maxDepth?: number; maxPages?: number; concurrency?: number; delayMs?: number; checkpointPath?: string; resume?: CrawlCheckpoint; resumePath?: string; includeQuery?: boolean; }
export interface CrawlCheckpoint { graph: SiteGraph; queue: Array<{ url: string; depth: number; parent?: string }>; }
export async function crawl(startUrl: string, options: CrawlOptions = {}): Promise<SiteGraph> {
  const start = canonicalize(startUrl, options.includeQuery ? { ignoreQueryParams: [] } : {}); const baseDomain = new URL(start).hostname;
  const resumed = options.resume ?? (options.resumePath ? JSON.parse(await Bun.file(options.resumePath).text()) as CrawlCheckpoint : undefined); const graph: SiteGraph = resumed?.graph ?? { baseDomain, startUrl: start, generatedAt: new Date().toISOString(), crawlMeta: { maxDepth: options.maxDepth ?? null, maxPages: options.maxPages ?? null, durationMs: 0, pageCount: 0, errorCount: 0 }, nodes: {} };
  const queue = resumed?.queue ?? [{ url: start, depth: 0 }]; const robots = await fetchRobotsRules(start); const began = Date.now(); let nextRequestAt = 0; let reservedPages = graph.crawlMeta.pageCount;
  const processItem = async (): Promise<void> => {
    while (queue.length) {
    const item = queue.shift()!; const url = canonicalize(item.url, options.includeQuery ? { ignoreQueryParams: [] } : {});
    if (graph.nodes[url]) { if (item.parent && !graph.nodes[url].parents.includes(item.parent)) graph.nodes[url].parents.push(item.parent); continue; }
    if (!isSameScope(url, baseDomain) || !isAllowedByRobots(url, robots) || (options.maxDepth !== undefined && item.depth > options.maxDepth) || (options.maxPages !== undefined && reservedPages >= options.maxPages)) continue;
    reservedPages += 1;
    const now = Date.now(); const scheduled = Math.max(now, nextRequestAt); nextRequestAt = scheduled + (options.delayMs ?? 200); const wait = scheduled - now; if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    const result = await fetchPage(url); const node: SiteNode = { url, path: new URL(url).pathname, depth: item.depth, status: result.status || null, contentType: result.contentType, title: null, discoveredAt: new Date().toISOString(), parents: item.parent ? [item.parent] : [], children: [], error: result.error ?? null }; graph.nodes[url] = node; graph.crawlMeta.pageCount += 1;
    if (!result.ok) graph.crawlMeta.errorCount += 1;
    if (result.html) { node.title = extractPageMeta(result.html, result.finalUrl).title; for (const raw of extractLinks(result.html, result.finalUrl)) { const child = canonicalize(raw, options.includeQuery ? { ignoreQueryParams: [] } : {}); if (isSameScope(child, baseDomain) && isAllowedByRobots(child, robots)) { node.children.push(child); if (!graph.nodes[child] && (options.maxDepth === undefined || item.depth + 1 <= options.maxDepth)) queue.push({ url: child, depth: item.depth + 1, parent: url }); else if (graph.nodes[child] && !graph.nodes[child].parents.includes(url)) graph.nodes[child].parents.push(url); } } }
    if (options.checkpointPath) await Bun.write(options.checkpointPath, JSON.stringify({ graph, queue }));
  }
  };
  await Promise.all(Array.from({ length: Math.max(1, options.concurrency ?? 5) }, processItem));
  graph.crawlMeta.durationMs += Date.now() - began; return graph;
}
