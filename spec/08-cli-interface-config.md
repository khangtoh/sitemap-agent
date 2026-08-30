# Phase 08 — CLI interface &amp; config

Goal: the actual command surface a user runs — `sitemap-agent crawl
<domain>` and friends — wiring Phases 05–07 into a real, documented,
flag-driven CLI.

Depends on: Phase 05 (crawl orchestrator), Phase 06 (persistence/output).

- [x] `sitemap-agent crawl <domain-or-url>` — accepts either a bare domain
      (`example.com`, defaults to `https://` + that host) or a full start
      URL; runs Phase 05's `crawl`, then Phase 06's `writeSitemapJson` +
      `printRunSummary`.
- [x] Flags: `--max-depth <n>`, `--max-pages <n>`, `--concurrency <n>`,
      `--delay-ms <n>`, `--include-query` (disable default tracking-param
      stripping from Phase 02), `--output <path>` (default `./sitemap.json`),
      `--render` (also invoke Phase 07's render immediately after crawling,
      writing `visual.html` alongside the JSON), `--resume <checkpoint>`.
- [x] `sitemap-agent render <sitemap.json> [--out <path>]` — standalone
      render command wired to Phase 07, no network access.
- [x] Config file support: an optional `.sitemaprc.json` in the working
      directory providing defaults for any of the above flags; explicit CLI
      flags override config-file values, which override built-in defaults
      (document the precedence in `--help` output).
- [x] `sitemap-agent --help` / `sitemap-agent crawl --help` — full usage,
      every flag documented with its default.
- [x] Exit codes: `0` success, distinguish a CLI-usage error (bad/missing
      argument, exit e.g. `64`) from a crawl-completed-with-errors exit
      (Phase 06's contract) from an unexpected crash (non-zero, with the
      error printed to stderr, not a stack-trace dump to stdout).

## Findings / Results

### 2026-08-30

- CLI crawl/render/config/help paths and exit-code handling are covered by
  unit/integration tests; standalone rendering is verified offline.
