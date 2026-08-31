# sitemap-agent

Crawls a base domain (`example.com`), discovers its reachable subpages
(`example.com/a`, `example.com/b`, `example.com/b/1`, …), and produces:

1. a **data representation** — a JSON graph (`sitemap.json`), explicitly
   *not* a `sitemap.xml`; and
2. a **visual representation** — a self-contained, offline-viewable
   interactive HTML tree/graph (`visual.html`).

This repo is spec-driven with [specloop](https://github.com/khangtoh/specloop)
— read **[`spec/README.md`](spec/README.md)** first. It's the goal, the
non-goals, and the phase index; everything else is either an atomic phase
checklist under `spec/NN-*.md` or a process file the loop itself follows.

## Status

Working end to end. Phases 01–09 (URL scoping, fetch and link extraction, the
graph model, the crawl orchestrator, persistence, the visual, the CLI, and the
test suite) are complete; Phase 10 is packaging and the acceptance evidence —
see [`spec/README.md`](spec/README.md#phases) for the live per-phase status and
[`spec/agent-session-ledger.md`](spec/agent-session-ledger.md) for what the
last session actually did.

## Usage

```bash
bun install
bun run bin/sitemap-agent.ts crawl example.com --max-depth 3 --max-pages 500 --render
bun run bin/sitemap-agent.ts render sitemap.json --out visual.html
```

`crawl` accepts `--max-depth`, `--max-pages`, `--concurrency`, `--delay-ms`,
`--output`, `--render`, and `--resume`. An optional `.sitemaprc.json` supplies
defaults; CLI flags take precedence. `visual.html` is a self-contained,
offline interactive tree with filtering and per-page metadata.

## Example run

[`examples/fixture/`](examples/fixture) holds a committed end-to-end run: a
small static site (`examples/fixture/site/`), the `sitemap.json` graph the CLI
produced by crawling it over real HTTP, and the `visual.html` rendered from
that graph. [`examples/fixture/README.md`](examples/fixture/README.md) has the
exact commands to reproduce it.

A node in `sitemap.json` looks like this:

```json
{
  "url": "http://127.0.0.1:8787/b/1",
  "path": "/b/1",
  "depth": 2,
  "status": 200,
  "contentType": "text/html;charset=utf-8",
  "title": "B / 1",
  "discoveredAt": "2026-08-31T01:40:25.690Z",
  "parents": ["http://127.0.0.1:8787/b", "http://127.0.0.1:8787/b/2"],
  "children": ["http://127.0.0.1:8787/b", "http://127.0.0.1:8787/b/2"],
  "error": null
}
```

`visual.html` renders those nodes as a collapsible path tree with a filter box
and a detail pane; the graph JSON is inlined into the file, so it opens offline
from disk with no server and no network fetches.

## Get started (once cloned)

```bash
bun install
bun run typecheck
bun test
bunx --bun @khangtoh/specloop check     # validate the spec structure
bunx --bun @khangtoh/specloop list-spec # see the ranked backlog
```

If `bun run typecheck` reports `TS2688: Cannot find type definition file for
'bun-types'`, the install landed as links your filesystem can't resolve (seen
on proot/Android and some network mounts). Reinstall with real files:

```bash
rm -rf node_modules && bun install --backend=copyfile
```

Then hand the repo to an agent (Claude Code, Codex, or any CLI-capable
agent) with instructions to follow `AGENTS.md` and work the loop: take the
top `spec/BACKLOG.md` phase whose `Depends on:` is satisfied, implement its
next task, verify, check the box, `specloop check`, hand off, commit,
repeat — until Phase 10's acceptance checkbox in `spec/README.md` is
checked with evidence.

## Why specloop here

The requirement → plan → spec breakdown KT asked for maps directly onto
specloop's model: `spec/README.md`'s goal + non-goals is the requirement,
`spec/BACKLOG.md`'s ranked phase order is the plan, and each `spec/NN-*.md`
file's atomic, independently-verifiable checkboxes are the spec — small
enough for an agent to pick up one box at a time and prove it's done rather
than asserting it.
