# Phase 09 — Testing &amp; validation

Goal: confidence that the crawler behaves correctly against a *real*, if
small, link graph — not just isolated unit fixtures — and that the whole
suite is green and CI-runnable.

Depends on: Phase 02 (URL/scope), Phase 03 (fetch/extraction), Phase 05
(orchestrator) — the pieces this phase integration-tests together.

- [x] Build a local fixture "site": a tiny static HTTP server (started/
      stopped within the test) serving a handful of HTML pages that
      reproduce the requirement's own example shape — a root page, `/a`,
      `/b`, `/b/1` (linked from `/b`), plus: one page linked from two
      different parents (multi-parent case), one out-of-scope external
      link (must NOT be crawled), one link that 404s, and one non-HTML
      asset link (e.g. an image) that must be recorded but not parsed for
      links.
- [x] Integration test: run `crawl(fixtureRootUrl, {})` against the fixture
      server and assert the resulting `SiteGraph` contains exactly the
      expected in-scope pages, correctly excludes the external link, records
      the 404 as an error node instead of crashing the crawl, and shows the
      multi-parent page with both parents present.
- [x] Integration test: depth-limited crawl (`maxDepth: 1`) against the same
      fixture asserts deeper pages are correctly excluded.
- [x] Integration test: `writeSitemapJson` → `renderVisualHtml` end-to-end
      against the fixture crawl's graph produces HTML containing every
      fixture page's path.
- [x] Unit test coverage check for Phase 02 (URL normalization/scope edge
      cases: fragments, tracking params, relative resolution, robots.txt
      allow/disallow) — confirm these already exist from Phase 02 and are
      still green, don't re-derive them here.
- [x] `bun test` runs the full suite (unit + integration) green in CI
      (no external network access required — the fixture server is local).
      Acceptance: `bun test` exit 0, and note the pass count in Findings.

## Findings / Results

### 2026-08-30

- Added isolated local HTTP fixture coverage. `bun test` passes 19 tests with
  no external network access.
