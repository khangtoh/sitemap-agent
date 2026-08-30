export interface SiteNode { url: string; path: string; depth: number; status: number | null; contentType: string | null; title: string | null; discoveredAt: string; parents: string[]; children: string[]; error: string | null; }
export interface SiteGraph { baseDomain: string; startUrl: string; generatedAt: string; crawlMeta: { maxDepth: number | null; maxPages: number | null; durationMs: number; pageCount: number; errorCount: number }; nodes: Record<string, SiteNode>; }

export function validateSiteGraph(data: unknown): SiteGraph {
  if (!isObject(data) || !isString(data.baseDomain) || !isString(data.startUrl) || !isString(data.generatedAt) || !isObject(data.crawlMeta) || !isObject(data.nodes)) throw new Error("Invalid SiteGraph: required top-level fields are missing or malformed");
  const meta = data.crawlMeta;
  if (!nullableNumber(meta.maxDepth) || !nullableNumber(meta.maxPages) || !isNumber(meta.durationMs) || !isNumber(meta.pageCount) || !isNumber(meta.errorCount)) throw new Error("Invalid SiteGraph: crawlMeta is malformed");
  for (const [url, node] of Object.entries(data.nodes)) {
    if (!isObject(node) || node.url !== url || !isString(node.path) || !isNumber(node.depth) || !nullableNumber(node.status) || !nullableString(node.contentType) || !nullableString(node.title) || !isString(node.discoveredAt) || !stringArray(node.parents) || !stringArray(node.children) || !nullableString(node.error)) throw new Error(`Invalid SiteGraph: node ${url} is malformed`);
  }
  return data as unknown as SiteGraph;
}
export function serializeSiteGraph(graph: SiteGraph): string { validateSiteGraph(graph); return `${JSON.stringify(sortValue(graph), null, 2)}\n`; }
export function deserializeSiteGraph(json: string): SiteGraph { try { return validateSiteGraph(JSON.parse(json)); } catch (error) { if (error instanceof SyntaxError) throw new Error(`Invalid SiteGraph JSON: ${error.message}`); throw error; } }
function sortValue(value: unknown): unknown { if (Array.isArray(value)) return value.map(sortValue); if (isObject(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortValue(value[key]) ])); return value; }
function isObject(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function isString(value: unknown): value is string { return typeof value === "string"; }
function isNumber(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }
function nullableNumber(value: unknown): boolean { return value === null || isNumber(value); }
function nullableString(value: unknown): boolean { return value === null || isString(value); }
function stringArray(value: unknown): boolean { return Array.isArray(value) && value.every(isString); }
