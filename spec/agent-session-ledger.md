# Agent Session Ledger

## Session: 2026-08-30

### Scope of this session

- Completed Phase 02, URL normalization and domain scope.

### What got done, in order

- Added URL resolution, canonicalization, exact-host scoping with opt-in
  subdomains, canonical URL deduplication, and robots.txt parsing/enforcement.
- Added focused unit tests and documented all Phase 02 rules in `src/url/README.md`.

### State left running / open

- Phase 03 (fetch and static-HTML link extraction) is the next eligible phase.

A running record of what an agent session actually did on this repo —
decisions made, state changed, automation left running — so the next
session (human or agent) can resume without re-deriving context or
re-litigating settled calls. Append a new dated entry per session; never
rewrite history in an earlier entry (if something changes, add a note,
don't edit the old record).

This is a log, not a spec. Requirements and task checklists live in
`spec/*.md`; this file is "what happened and why," cross-referencing
those files rather than duplicating their content.

Read this first when resuming after a break; append a new entry when
closing one out.

---

## Session: 2026-08-30 (branch `main`)

### Scope of this session

Author the full requirement → phase-spec breakdown for a site-mapping agent
(crawl a base domain, build a JSON graph — not `sitemap.xml` — and render a
self-contained visual), starting from a bare `specloop init` scaffold.

### What got done, in order

1. Wrote `spec/README.md`: goal, non-goals, and the 10-phase index/table.
2. Wrote all 10 phase files (`01-project-scaffold.md` …
   `10-packaging-github-bootstrap.md`), each with `Goal:`/`Depends on:` and
   atomic checkboxes. Dependency chain: 01 → 02 → 03 → (04 parallel to
   02/03) → 05 (needs 03+04) → 06 → 07 (needs 04+06) → 08 (needs 05+06) → 09
   (needs 02+03+05) → 10 (needs 07+08+09).
3. Updated `spec/BACKLOG.md` with the real phase order (was still the
   template's single example entry).
4. Executed Phase 01 for real, not just spec'd it: `package.json`,
   `bin/sitemap-agent.ts`, `tsconfig.json`, `test/placeholder.test.ts`,
   `.gitignore`, `.github/workflows/ci.yml`. Verified `bun run
   bin/sitemap-agent.ts` runs clean and `bun test` is 1/1 green. Checked off
   Phase 01's 5 boxes and its index row.
5. `specloop check` → green: 10 phases, 5/58 tasks checked.

### State left running / open

Not run in this session: `bun install` against the two devDependencies
(`@khangtoh/specloop`, `typescript`) or `tsc --noEmit` itself — confirm
these first on a real machine (see Phase 01 Findings for the caveat on why
its index row is ✅ despite this). Next unchecked box: top of
`BACKLOG.md`'s undone list — Phase 02, URL normalization & domain scope.
