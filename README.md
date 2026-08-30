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

Scaffold-only right now. Phase 01 (project skeleton) is done; Phases 02–10
(the actual crawler, data model, visual, CLI, tests, and GitHub-bootstrap
packaging) are specified but not yet implemented — see
[`spec/README.md`](spec/README.md#phases) for the live per-phase status and
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

## Get started (once cloned)

```bash
bun install
bun run typecheck
bun test
bunx --bun @khangtoh/specloop check     # validate the spec structure
bunx --bun @khangtoh/specloop list-spec # see the ranked backlog
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
