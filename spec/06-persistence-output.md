# Phase 06 — Persistence &amp; output

Goal: turn a completed (or checkpointed) `SiteGraph` into durable artifacts
on disk plus a human-readable run summary — the concrete "data
representation" file the rest of the deliverable (and Phase 07's visual)
consumes.

Depends on: Phase 05 (crawl orchestrator produces the `SiteGraph` this phase
persists).

- [x] `writeSitemapJson(graph: SiteGraph, outPath: string): Promise<void>` —
      serialize via Phase 04's `serializeSiteGraph` and write to
      `outPath` (default `./sitemap.json`), creating parent directories as
      needed.
- [x] Wire Phase 05's checkpointing (crawl-in-progress state) through this
      module too, so there is one write path for "partial" and "final"
      output rather than two divergent ones.
- [x] `printRunSummary(graph: SiteGraph): void` — console summary after a
      crawl: total pages, max depth reached, error count (with a short list
      of failed URLs and their status/error), duration, output file path(s).
- [x] Exit-code contract: `0` on a crawl that completed within its limits
      with no fetch errors, a non-zero code when the crawl finished but
      recorded fetch errors (so it's scriptable/CI-checkable), distinct from
      a genuine CLI-usage error (Phase 08's concern).
- [x] Unit-verify `writeSitemapJson` + re-read round-trips to an identical
      `SiteGraph` (deep-equal), and that `printRunSummary` doesn't throw on
      an empty/error-only graph. Acceptance: passes under `bun test`.

## Findings / Results

### 2026-08-30

- Added durable final/checkpoint output, summary and exit helpers, and
  round-trip persistence coverage.
