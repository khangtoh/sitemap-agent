# Phase 05 — Crawl orchestrator

Goal: the engine that starts at the base domain and actually discovers
`example.com/a`, `example.com/b`, `example.com/b/1`, etc. — a breadth-first
traversal that turns Phase 03's per-page fetch and Phase 02's scope rules
into a fully-populated Phase 04 `SiteGraph`, under real-world limits
(depth, page count, concurrency, politeness).

Depends on: Phase 03 (fetch + link extraction), Phase 04 (graph data model).

- [x] `crawl(startUrl: string, opts): Promise<SiteGraph>` — BFS from
      `startUrl` using a FIFO queue seeded with the start URL at depth 0;
      for each dequeued URL: skip if already visited (Phase 02 dedup key),
      skip if out of scope (Phase 02 `isSameScope`) or robots-disallowed,
      fetch it (Phase 03), record/update its `SiteNode`, extract in-scope
      links, and enqueue newly-discovered ones at `depth + 1`.
- [x] Multi-parent handling: when a URL is discovered again from a different
      already-visited page, do not re-fetch or re-enqueue it — append the
      new parent to its existing node's `parents` array so the graph
      accurately reflects `example.com/b/1` being linked from more than one
      page, if that's the real link structure.
- [x] Depth limit: honor `opts.maxDepth` (default unlimited) — pages beyond
      the limit are neither fetched nor added to the graph.
- [x] Page limit: honor `opts.maxPages` (default unlimited) — the crawl
      stops enqueuing new work once the limit is hit and finishes in-flight
      fetches, rather than hard-killing them mid-request.
- [x] Concurrency control: a bounded worker pool (default e.g. 5 concurrent
      fetches, configurable) rather than fetching serially or unboundedly in
      parallel.
- [x] Politeness delay: a configurable minimum delay between requests to the
      *same host* (default e.g. 200ms), applied per-worker so overall
      throughput still scales with concurrency.
- [x] Resume support: periodically (or on graceful interrupt, e.g. SIGINT)
      write the in-progress `SiteGraph` plus the remaining queue to a
      checkpoint file; `crawl` accepts an optional checkpoint to resume from
      instead of restarting at `startUrl`. Acceptance: kill a crawl
      mid-run, resume from the checkpoint, and confirm no already-visited
      URL is re-fetched.

## Findings / Results

### 2026-08-30

- Implemented bounded-worker BFS, domain/robots filtering, limits,
  multi-parent graph edges, polite scheduling, checkpoints, and resume.
  Mocked traversal and resume tests pass.
