import { describe, expect, test } from "bun:test";
import { canonicalize, dedupeKey, isAllowedByRobots, isSameScope, parseRobotsRules, resolveUrl } from "../src/url";

describe("resolveUrl", () => {
  test("resolves relative HTTP links and rejects unusable schemes", () => {
    expect(resolveUrl("https://example.com/docs/page", "../about")).toBe("https://example.com/about");
    expect(resolveUrl("https://example.com", "mailto:team@example.com")).toBeNull();
    expect(resolveUrl("https://example.com", "")).toBeNull();
  });
});
describe("canonicalize", () => {
  test("normalizes identity while retaining meaningful queries", () => {
    const url = canonicalize("HTTPS://EXAMPLE.COM:443/docs/?b=2&utm_source=x&a=1#intro");
    expect(url).toBe("https://example.com/docs?a=1&b=2");
    expect(canonicalize("http://example.com:80/")).toBe("http://example.com/");
    expect(dedupeKey(url)).toBe(url);
  });
  test("supports a caller-provided query ignore list", () => {
    expect(canonicalize("https://example.com/?keep=no&x=1", { ignoreQueryParams: ["x"] })).toBe("https://example.com/?keep=no");
  });
});
test("scope defaults to the exact base host and can include subdomains", () => {
  expect(isSameScope("https://example.com/a", "example.com")).toBe(true);
  expect(isSameScope("https://www.example.com/a", "example.com")).toBe(false);
  expect(isSameScope("https://www.example.com/a", "example.com", { includeSubdomains: true })).toBe(true);
  expect(isSameScope("https://notexample.com/a", "example.com", { includeSubdomains: true })).toBe(false);
});
test("robots uses exact user agent, longest path, and allow tie-breaker", () => {
  const robots = parseRobotsRules("User-agent: *\nDisallow: /private\nAllow: /private/public\n\nUser-agent: sitemap-agent\nDisallow: /blocked\nAllow: /blocked/open\nDisallow: /same\nAllow: /same");
  expect(isAllowedByRobots("https://example.com/blocked", robots)).toBe(false);
  expect(isAllowedByRobots("https://example.com/blocked/open/page", robots)).toBe(true);
  expect(isAllowedByRobots("https://example.com/same", robots)).toBe(true);
  expect(isAllowedByRobots("https://example.com/private", robots)).toBe(true);
});
