# Phase 02 — URL normalization &amp; domain scope

Goal: a pure, well-tested utility module that turns raw hrefs found on a page
into canonical, deduplicated, in-scope-or-out-of-scope URLs — the correctness
foundation every later crawl decision depends on.

Depends on: Phase 01 (project scaffold builds and tests run).

- [x] `resolveUrl(base: string, href: string): string | null` — resolve a
      possibly-relative href against the page's base URL using the platform
      `URL` constructor; return `null` for unresolvable/invalid hrefs
      (`mailto:`, `javascript:`, `tel:`, empty, malformed).
- [x] `canonicalize(url: string, opts): string` — lowercase scheme/host, strip
      the fragment (`#...`), strip a configurable default port (80/443),
      strip a trailing slash except for the root path, and drop query
      parameters that match a configurable ignore-list (default: common
      tracking params `utm_*`, `fbclid`, `gclid`); keep other query params
      (order-normalized) since they can address distinct content.
- [x] `isSameScope(url: string, baseDomain: string, opts): boolean` —
      same-registrable-domain check against the crawl's base domain (default
      scope excludes subdomains and other domains per the project's
      non-goals; expose an option for future subdomain inclusion but it is
      not required to default-on).
- [x] `dedupeKey(canonicalUrl: string): string` — the canonical URL *is* the
      dedup key; document this explicitly so Phase 05's visited-set logic has
      one unambiguous source of truth.
- [x] `fetchRobotsRules(baseDomain: string): Promise<RobotsRules>` and
      `isAllowedByRobots(url: string, rules: RobotsRules): boolean` — fetch
      and parse `/robots.txt` for the crawl's user-agent (falling back to
      `*`), honoring `Disallow`/`Allow`; treat a missing or unparseable
      `robots.txt` as "allow all" rather than failing the crawl.
- [x] Document the normalization/scope rules and options in a short
      `src/url/README.md` (or module-header comment) so Phase 09's tests and
      Phase 08's config flags map 1:1 onto real behavior.

## Findings / Results

### 2026-08-30

- Implemented and unit-tested URL resolution, canonicalization, exact-host
  scope (with opt-in subdomains), canonical deduplication, and robots.txt
  parsing/enforcement. `bun test` and `bun run typecheck` verify the phase.
