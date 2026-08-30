# Phase 04 — Site graph data model

Goal: the single, explicit data representation of a crawled site (this is the
"map" requirement itself) — a typed, JSON-serializable graph, independent of
how it was crawled or how it will be rendered, so Phases 05–07 all read/write
the same shape.

Depends on: Phase 01 (project scaffold; this phase has no runtime dependency
on the crawler or fetch code, only on the project existing).

- [x] Define `SiteNode` type: `{ url: string (canonical), path: string,
      depth: number, status: number | null, contentType: string | null,
      title: string | null, discoveredAt: string (ISO timestamp), parents:
      string[] (canonical URLs of pages that link here), children:
      string[] (canonical URLs this page links to, in-scope only), error:
      string | null }`. A page reachable via multiple parents keeps a single
      node with multiple `parents` entries — the map is a graph, not
      strictly a tree, and example.com/b/1 having exactly one parent (b) is
      the common case, not an assumed invariant.
- [x] Define `SiteGraph` type: `{ baseDomain: string, startUrl: string,
      generatedAt: string, crawlMeta: { maxDepth: number | null, maxPages:
      number | null, durationMs: number, pageCount: number, errorCount:
      number }, nodes: Record<string /* canonical url */, SiteNode> }`.
- [x] Write `schema/sitemap.schema.json` (JSON Schema) describing the
      `SiteGraph` shape, and a `validateSiteGraph(data: unknown):
      SiteGraph` function that validates against it and throws a
      descriptive error on mismatch — this is the data-representation
      deliverable's contract, not just an internal type.
- [x] `serializeSiteGraph(graph: SiteGraph): string` (stable key ordering
      for readable diffs) and `deserializeSiteGraph(json: string):
      SiteGraph` (validates via the schema on load).
- [x] Unit-verify round-tripping (`serialize` → `deserialize` → deep-equal)
      and schema-rejection of a deliberately malformed sample. Acceptance:
      both pass under `bun test`.

## Findings / Results

### 2026-08-30

- Added typed graph model, schema artifact, deterministic serialization, and
  descriptive validation with round-trip and rejection tests.
