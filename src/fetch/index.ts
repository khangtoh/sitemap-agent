import { resolveUrl } from "../url";

export interface FetchOptions {
  timeoutMs?: number;
  userAgent?: string;
  retries?: number;
  retryDelayMs?: number;
}

export interface FetchResult {
  url: string;
  finalUrl: string;
  status: number;
  contentType: string | null;
  ok: boolean;
  error?: string;
  /** Present only for successful HTML responses, so callers never parse binaries. */
  html?: string;
}

export interface PageMeta {
  title: string;
  canonicalUrl?: string;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_USER_AGENT = "sitemap-agent/0.1";
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 100;

/** Fetch one page with bounded retries; all failures are represented as results. */
export async function fetchPage(url: string, options: FetchOptions = {}): Promise<FetchResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": userAgent },
      });
      clearTimeout(timeout);
      const contentType = response.headers.get("content-type");
      const retryable = response.status >= 500;
      if (retryable && attempt < retries) {
        await delay(retryDelayMs * (attempt + 1));
        continue;
      }
      const result: FetchResult = {
        url,
        finalUrl: response.url || url,
        status: response.status,
        contentType,
        ok: response.ok,
      };
      if (response.ok && isHtmlContentType(contentType)) result.html = await response.text();
      return result;
    } catch (error) {
      clearTimeout(timeout);
      if (attempt < retries) {
        await delay(retryDelayMs * (attempt + 1));
        continue;
      }
      return {
        url,
        finalUrl: url,
        status: 0,
        contentType: null,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  return { url, finalUrl: url, status: 0, contentType: null, ok: false, error: "Retry loop exhausted" };
}

/** Extract absolute HTTP(S) href targets from anchors only. */
export function extractLinks(html: string, pageUrl: string): string[] {
  const links: string[] = [];
  parseHtml(html, (tag) => {
    if (tag.name === "a") {
      const url = resolveUrl(pageUrl, tag.attributes.href ?? "");
      if (url) links.push(url);
    }
  });
  return links;
}

/** Extract human-readable page metadata without using it for traversal. */
export function extractPageMeta(html: string, pageUrl: string): PageMeta {
  let title = "";
  let titleDepth = 0;
  let canonicalUrl: string | undefined;
  parseHtml(html, (tag) => {
    if (tag.name === "title") titleDepth += 1;
    if (tag.name === "link" && tag.attributes.rel?.split(/\s+/).some((value) => value.toLowerCase() === "canonical")) canonicalUrl = tag.attributes.href ? resolveUrl(pageUrl, tag.attributes.href) ?? undefined : undefined;
  }, (text) => { if (titleDepth) title += text; }, (tag) => { if (tag.name === "title") titleDepth -= 1; });
  title = title.trim();
  return { title, canonicalUrl };
}

export function isHtmlContentType(contentType: string | null): boolean {
  return Boolean(contentType?.toLowerCase().startsWith("text/html"));
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

interface HtmlTag { name: string; attributes: Record<string, string>; }

/** A small quote-aware HTML tokenizer, deliberately used instead of regex extraction. */
function parseHtml(html: string, onOpen: (tag: HtmlTag) => void, onText?: (text: string) => void, onClose?: (tag: HtmlTag) => void): void {
  let position = 0;
  while (position < html.length) {
    const open = html.indexOf("<", position);
    if (open < 0) { onText?.(html.slice(position)); break; }
    if (open > position) onText?.(html.slice(position, open));
    if (html.startsWith("<!--", open)) { const end = html.indexOf("-->", open + 4); position = end < 0 ? html.length : end + 3; continue; }
    const end = tagEnd(html, open + 1);
    if (end < 0) { onText?.(html.slice(open)); break; }
    const raw = html.slice(open + 1, end).trim();
    position = end + 1;
    if (!raw || raw.startsWith("!") || raw.startsWith("?")) continue;
    if (raw.startsWith("/")) { onClose?.({ name: raw.slice(1).trim().toLowerCase(), attributes: {} }); continue; }
    const tag = parseTag(raw);
    if (tag) onOpen(tag);
  }
}

function tagEnd(html: string, start: number): number {
  let quote = "";
  for (let index = start; index < html.length; index += 1) {
    const character = html[index];
    if (quote) { if (character === quote) quote = ""; }
    else if (character === "\"" || character === "'") quote = character;
    else if (character === ">") return index;
  }
  return -1;
}

function parseTag(raw: string): HtmlTag | null {
  const nameMatch = raw.match(/^([A-Za-z][A-Za-z0-9:-]*)/);
  if (!nameMatch) return null;
  const attributes: Record<string, string> = {};
  let index = nameMatch[0].length;
  while (index < raw.length) {
    while (/\s|\//.test(raw[index] ?? "")) index += 1;
    const attributeMatch = raw.slice(index).match(/^([^\s=/>]+)/);
    if (!attributeMatch) break;
    const name = attributeMatch[0].toLowerCase(); index += name.length;
    while (/\s/.test(raw[index] ?? "")) index += 1;
    let value = "";
    if (raw[index] === "=") {
      index += 1; while (/\s/.test(raw[index] ?? "")) index += 1;
      const quote = raw[index];
      if (quote === "\"" || quote === "'") { index += 1; const close = raw.indexOf(quote, index); value = raw.slice(index, close < 0 ? raw.length : close); index = close < 0 ? raw.length : close + 1; }
      else { const valueMatch = raw.slice(index).match(/^[^\s>]+/); value = valueMatch?.[0] ?? ""; index += value.length; }
    }
    attributes[name] = value;
  }
  return { name: nameMatch[0].toLowerCase(), attributes };
}
