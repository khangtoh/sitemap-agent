/** Utilities for turning discovered href values into canonical crawl targets. */

export interface CanonicalizeOptions {
  /** Query-parameter names to discard. Matching is case-insensitive. */
  ignoreQueryParams?: readonly string[];
}

export interface ScopeOptions {
  /** Whether hosts below the supplied base domain are in scope. Defaults to false. */
  includeSubdomains?: boolean;
}

export interface RobotsRule {
  type: "allow" | "disallow";
  path: string;
}

export interface RobotsRules {
  rules: RobotsRule[];
  userAgent: string;
}

const DEFAULT_IGNORED_QUERY_PARAMS = ["utm_*", "fbclid", "gclid"];
const UNSUPPORTED_PROTOCOLS = new Set(["mailto:", "javascript:", "tel:"]);

/** Resolve a link as a web URL, returning null for unusable href values. */
export function resolveUrl(base: string, href: string): string | null {
  if (!href.trim()) return null;
  try {
    const resolved = new URL(href, base);
    if (UNSUPPORTED_PROTOCOLS.has(resolved.protocol)) return null;
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null;
    return resolved.href;
  } catch {
    return null;
  }
}

/** Canonicalize a valid HTTP(S) URL for graph identity and deduplication. */
export function canonicalize(url: string, options: CanonicalizeOptions = {}): string {
  const normalized = new URL(url);
  normalized.protocol = normalized.protocol.toLowerCase();
  normalized.hostname = normalized.hostname.toLowerCase();
  normalized.hash = "";
  if ((normalized.protocol === "http:" && normalized.port === "80") ||
      (normalized.protocol === "https:" && normalized.port === "443")) normalized.port = "";
  if (normalized.pathname.length > 1 && normalized.pathname.endsWith("/")) normalized.pathname = normalized.pathname.slice(0, -1);
  const ignored = options.ignoreQueryParams ?? DEFAULT_IGNORED_QUERY_PARAMS;
  const params = [...normalized.searchParams]
    .filter(([name]) => !matchesIgnoredParameter(name, ignored))
    .sort(([leftName, leftValue], [rightName, rightValue]) => leftName.localeCompare(rightName) || leftValue.localeCompare(rightValue));
  normalized.search = "";
  for (const [name, value] of params) normalized.searchParams.append(name, value);
  return normalized.href;
}

/** Return whether a URL belongs to the configured crawl domain. */
export function isSameScope(url: string, baseDomain: string, options: ScopeOptions = {}): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const baseHost = hostnameFromDomain(baseDomain);
    return host === baseHost || Boolean(options.includeSubdomains && host.endsWith(`.${baseHost}`));
  } catch {
    return false;
  }
}

/** A canonical URL is its own stable graph deduplication key. */
export function dedupeKey(canonicalUrl: string): string { return canonicalUrl; }

/** Fetch and select the applicable robots.txt group for this crawler. */
export async function fetchRobotsRules(baseDomain: string, userAgent = "sitemap-agent"): Promise<RobotsRules> {
  try {
    const response = await fetch(new URL("/robots.txt", originFromDomain(baseDomain)), { headers: { "user-agent": userAgent } });
    if (!response.ok) return allowAllRules(userAgent);
    return parseRobotsRules(await response.text(), userAgent);
  } catch { return allowAllRules(userAgent); }
}

/** Determine whether a URL is allowed by the selected robots.txt rules. */
export function isAllowedByRobots(url: string, robots: RobotsRules): boolean {
  let path: string;
  try { const parsed = new URL(url); path = `${parsed.pathname}${parsed.search}`; } catch { return false; }
  const matches = robots.rules.filter((rule) => rule.path && path.startsWith(rule.path));
  if (!matches.length) return true;
  matches.sort((a, b) => b.path.length - a.path.length || (a.type === "allow" ? -1 : 1));
  return matches[0].type === "allow";
}

export function parseRobotsRules(text: string, userAgent = "sitemap-agent"): RobotsRules {
  const groups: Array<{ agents: string[]; rules: RobotsRule[] }> = [];
  let group: { agents: string[]; rules: RobotsRule[] } | undefined;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split("#", 1)[0].trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (field === "user-agent") {
      if (!group || group.rules.length) { group = { agents: [], rules: [] }; groups.push(group); }
      group.agents.push(value.toLowerCase());
    } else if ((field === "allow" || field === "disallow") && group) group.rules.push({ type: field, path: value });
  }
  const target = userAgent.toLowerCase();
  const selected = groups.find((candidate) => candidate.agents.some((agent) => agent === target)) ?? groups.find((candidate) => candidate.agents.includes("*"));
  return { rules: selected?.rules ?? [], userAgent };
}

function matchesIgnoredParameter(name: string, patterns: readonly string[]): boolean {
  const lowerName = name.toLowerCase();
  return patterns.some((pattern) => { const lowerPattern = pattern.toLowerCase(); return lowerPattern.endsWith("*") ? lowerName.startsWith(lowerPattern.slice(0, -1)) : lowerName === lowerPattern; });
}
function hostnameFromDomain(domain: string): string { return new URL(domain.includes("://") ? domain : `https://${domain}`).hostname.toLowerCase(); }
function originFromDomain(domain: string): string { return new URL(domain.includes("://") ? domain : `https://${domain}`).origin; }
function allowAllRules(userAgent: string): RobotsRules { return { rules: [], userAgent }; }
