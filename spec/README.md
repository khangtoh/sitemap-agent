# site-mapper-agent — Spec Index

Goal: given a base domain (e.g. `example.com`), autonomously discover every
reachable same-domain page (e.g. `example.com/a`, `example.com/b`,
`example.com/b/1`) via link-following crawl, produce a structured **data
representation** of the site (a JSON graph of nodes/edges — explicitly not a
`sitemap.xml`), and render a **self-contained interactive visual** of that
graph for a human to explore. Ships as a `bun` CLI (`sitemap-agent crawl
<domain>`), tested, documented, and cleanly bootstrappable into a fresh GitHub
repo.

## How this spec set works

- Every numbered file under `spec/` is a phase. Every phase is a flat checklist
  of **atomic tasks** — each completable and verifiable in one short sitting.
  Unnumbered files such as `spec-summary-status.md` are process definitions or
  supporting records, not implementation phases.
- Check a box (`- [x]`) only once the task is actually done and, where
  applicable, verified.
- Every completed, partial, blocked, or documentation-only task handoff must
  include the canonical `Spec Summary/Status` report defined in
  [`spec-summary-status.md`](spec-summary-status.md).
- Phase **work order** lives in [`BACKLOG.md`](BACKLOG.md) (top = next), not in
  the filename number — reorder it with `specloop prio-spec <NN> <pos>`. Each
  phase's `Depends on:` still gates. Done-state is derived from the checkboxes.
- The loop: an agent takes the top `BACKLOG.md` phase whose `Depends on:` is
  met and its highest-priority box, does it, verifies it, updates its checkbox
  and the Results/status records, produces the mandatory `Spec Summary/Status`
  handoff, commits, and moves on — repeating until the goal's acceptance
  phase is fully checked and its live evidence is recorded below.

**Is a goal actually done?**
[`goal-completion-check.md`](goal-completion-check.md) — a reusable
prompt that traces a stated goal through requirements → mapped spec
phases → actual checkbox state, instead of answering from impression.
Use it before telling anyone something ships.

**How must agents report spec status?**
[`spec-summary-status.md`](spec-summary-status.md) — the canonical phase and
component/deliverable tables, counting rules, closing evidence fields, and
mandatory completion procedure for every agent handoff.

**What actually happened, session by session?**
[`agent-session-ledger.md`](agent-session-ledger.md) — a dated log of
what each agent session did, decided, and left running (distinct from
the spec files, which are requirements/checklists, not narrative).
Read this first when resuming after a break; append a new entry when
closing one out.

## Phases

Status column legend (defined in
[`spec-summary-status.md`](spec-summary-status.md)): ✅ complete ·
🟡 partial · ⬜ not started · ⛔ blocked. Progress is `checked/total`
boxes in the phase file; keep both in sync when checking boxes.
`specloop check` fails the build when a row's progress or emoji drifts
from the phase file it points to.

| # | File | Purpose | Status | Blocking dependency |
|---|------|---------|--------|----------------------|
| 01 | [01-project-scaffold.md](01-project-scaffold.md) | Bun project skeleton, CLI entrypoint stub, build/test/lint wiring | ✅ 5/5 | None |
| 02 | [02-url-normalization-scope.md](02-url-normalization-scope.md) | URL canonicalization, same-domain scoping, robots.txt respect, dedup key | ✅ 6/6 | Phase 01 |
| 03 | [03-fetch-link-extraction.md](03-fetch-link-extraction.md) | HTTP fetch wrapper + HTML link extraction | ✅ 6/6 | Phase 02 |
| 04 | [04-site-graph-model.md](04-site-graph-model.md) | SiteNode/SiteGraph data types, JSON schema, (de)serialization | ✅ 5/5 | Phase 01 |
| 05 | [05-crawl-orchestrator.md](05-crawl-orchestrator.md) | BFS crawl loop: queue, depth/page limits, concurrency, politeness, resume | ✅ 7/7 | Phase 03, Phase 04 |
| 06 | [06-persistence-output.md](06-persistence-output.md) | Write `sitemap.json`, incremental checkpointing, run summary | ✅ 5/5 | Phase 05 |
| 07 | [07-visual-representation.md](07-visual-representation.md) | Self-contained interactive HTML tree/graph view of the site map | ✅ 6/6 | Phase 04, Phase 06 |
| 08 | [08-cli-interface-config.md](08-cli-interface-config.md) | `sitemap-agent crawl <domain>` command, flags, config file, `--help` | ✅ 6/6 | Phase 05, Phase 06 |
| 09 | [09-testing-validation.md](09-testing-validation.md) | Unit + mocked-HTTP + fixture-site integration tests, green `bun test` | ✅ 6/6 | Phase 02, Phase 03, Phase 05 |
| 10 | [10-packaging-github-bootstrap.md](10-packaging-github-bootstrap.md) | README, LICENSE, CI workflow, end-to-end fixture run, clean-clone bootstrap | 🟡 4/6 | Phase 07, Phase 08, Phase 09 |

## Status

- [ ] **`sitemap-agent crawl <domain>` run against a real or fixture site
  produces a valid `sitemap.json` graph and a self-contained `visual.html`,
  with `bun test` and `specloop check` green, and the repo bootstraps cleanly
  via `git clone` → `bun install` → `specloop check` on a fresh machine.** —
  the single checkbox that means the whole project's goal is met. Record the
  live evidence (run output, artifact paths) next to it when it flips to `[x]`.
- Overall phase progress: see individual files.

## Non-goals

- No `sitemap.xml` generation (that's a solved, different format — this is a
  graph data representation plus a visual, not an SEO sitemap).
- No JavaScript rendering / SPA crawling in v1 (link discovery is static-HTML
  `<a href>` extraction only; headless-browser rendering is a future phase,
  not part of this goal).
- No crawling of subdomains or external domains by default (same-registrable-
  domain only, though scope may be config-exposed later — not required for
  the acceptance goal).
- No distributed/multi-machine crawling — single-process, single-host only.
- No authentication-gated crawling (public pages only).
