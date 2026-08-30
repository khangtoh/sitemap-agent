# Phase 03 — Fetch &amp; link extraction

Goal: given a single URL, reliably fetch it and extract every same-document
outbound link plus enough page metadata (status, title, content-type) to
populate one graph node — without ever throwing on a bad page.

Depends on: Phase 02 (URL normalization/scope utilities exist and are used
here to filter extracted links).

- [x] `fetchPage(url: string, opts): Promise<FetchResult>` — wraps `fetch`
      with: a configurable timeout (default e.g. 10s), a configurable
      `User-Agent` header identifying the agent (e.g. `sitemap-agent/0.1`),
      redirect following with the final resolved URL recorded, and a bounded
      retry-with-backoff on network errors/5xx (default 2 retries).
      `FetchResult` captures `{ url, finalUrl, status, contentType, ok,
      error? }` and never throws — network/timeout/DNS failures become a
      `FetchResult` with `ok: false` and an `error` string.
- [x] Content-type guard: only attempt link extraction when the response
      `Content-Type` is `text/html*`; non-HTML responses (PDFs, images,
      JSON, etc.) are recorded as a leaf node with their content-type and
      status but are not parsed for links.
- [x] `extractLinks(html: string, pageUrl: string): string[]` — parse `<a
      href>` targets (and, where present, a `<link rel="canonical">` for
      metadata, not traversal) using an HTML parser (not regex), resolve each
      href via Phase 02's `resolveUrl`, and return the resolved absolute URLs
      before scope filtering (scope filtering is the orchestrator's job in
      Phase 05, not this module's).
- [x] `extractPageMeta(html: string, pageUrl: string): PageMeta` — pull
      `<title>` text (trimmed, may be empty) for use as the human-readable
      node label in the visual (Phase 07).
- [x] Status handling: 2xx → page eligible for link extraction per the
      content-type guard above; 3xx is resolved transparently by `fetch`'s
      redirect following (final URL recorded, not treated as a separate
      error); 4xx/5xx → recorded as a node with that status and no
      children, not a crawl-halting error.
- [x] Unit-verify against a handful of hand-written HTML fixtures (absolute
      links, relative links, links with fragments/query params, a
      non-`<a>` false-positive like a `<link>` stylesheet href that must
      NOT be extracted as a page link). Acceptance: fixtures pass under
      `bun test`.

## Findings / Results

### 2026-08-30

- Added non-throwing fetch/retry/timeout handling and quote-aware static HTML
  parsing for anchors, title, and canonical-link metadata. Unit tests pass.
