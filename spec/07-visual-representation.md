# Phase 07 — Visual representation

Goal: the second half of the deliverable KT asked for explicitly — a visual,
human-facing rendering of the site map, produced *after* the data
representation is solid, as a single self-contained HTML file (no server, no
build step required to view it).

Depends on: Phase 04 (graph data model — this renders a `SiteGraph`), Phase
06 (persistence — the visual is generated from a written `sitemap.json`, so
it can be regenerated from a past crawl without re-crawling).

- [x] `renderVisualHtml(graph: SiteGraph): string` — produces one
      self-contained HTML document (inline CSS/JS, no external CDN
      dependency so it works fully offline) with the graph's node/edge data
      embedded as an inline JSON blob (reuse Phase 04's serializer).
- [x] Layout: a collapsible tree view rooted at `startUrl`, expandable by
      depth, showing each node's path segment as the label; nodes with
      `error`/non-2xx `status` are visually distinguished (e.g. color/badge)
      from healthy nodes.
- [x] Multi-parent nodes (Phase 05's graph, not strict-tree, case): render
      them attached under their primary/first-discovered parent in the tree
      layout, with a visible indicator (e.g. a badge or dotted secondary
      edge) noting the additional parent(s) — do not silently duplicate the
      node into two independent subtrees with no link between them.
- [x] Basic interactivity: expand/collapse subtrees, a text filter box that
      highlights/filters nodes by path substring, and a hover/click detail
      panel showing the node's full metadata (status, title, discovered-at,
      parents).
- [x] `sitemap-agent render <sitemap.json> [--out visual.html]` produces the
      file from a previously-saved `sitemap.json` without touching the
      network (wired into the CLI properly in Phase 08; this phase owns the
      rendering function itself).
- [x] Verify by rendering the graph produced by a Phase 09 fixture crawl and
      confirming in the generated HTML: all discovered fixture pages appear,
      the known multi-parent fixture page shows both parents, and opening
      the file with no network access still renders correctly (no external
      asset 404s).

## Findings / Results

### 2026-08-30

- Inline visual renderer and standalone render-command tests pass against the
  local fixture graph; no external visual assets are emitted.

### 2026-08-31

- Reopened during Phase 10 acceptance QA, driving the generated file in a
  headless browser rather than only asserting on the HTML string. The filter
  box was broken: `branch()` returned early when the *root* path missed the
  query, so filtering for any non-root page (`about`, `b/`) emptied the whole
  tree. The string-level test could not see it.
- Fixed: a node is kept when it matches **or** any descendant matches, and the
  ancestors kept purely as context render `.faded`. A query matching nothing
  now yields an empty tree instead of an unfiltered one.
- The tree builder moved out of the inline `<script>` string into an exported,
  self-contained `buildTreeHtml(graph, query)` that is serialized into the page
  with `toString()`, so tests exercise the same code the browser runs. Two
  regression tests cover the ancestor-retention and no-match cases.
- Re-verified in a headless browser on `examples/fixture/visual.html`: 7 nodes
  render from `file://`, `about` → `/`(faded) + `about`, `b/` → `/`(faded),
  `b`(faded), `b/1`, `b/2`, `zzz` → empty, clicking a node fills the detail
  pane and toggles its subtree, zero console errors, and the only network
  request is the HTML file itself.
