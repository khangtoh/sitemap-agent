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

---

## Session: 2026-08-31 (branch `master`)

### Scope of this session

`specloop` goal run: close Phase 10 and the project's single acceptance
checkbox in `spec/README.md`.

### What got done, in order

1. Preflight. The 2026-08-30 blocker ("no `.git` metadata or remote clone
   source") is resolved — the workspace is a real repo on `master`. Still no
   `origin` remote, so clean-clone proof is against a local clone URL.
2. Diagnosed `bun run typecheck` failing `TS2688`: on this host `bun install`
   writes `node_modules/bun-types` as unresolvable link stubs. Reproduced in a
   clean clone, then fixed with `bun install --backend=copyfile`; `tsc
   --noEmit` is clean afterwards. Host issue, not a project defect —
   documented in the README rather than worked around in code.
3. Replaced the hand-authored `examples/fixture/sitemap.json` with a genuine
   end-to-end run: added `examples/fixture/site/` (nested paths, robots-
   disallowed path, off-domain and `mailto:` links, a `utm_source` param, a
   fragment self-link) and `serve.ts`, crawled it through the CLI over HTTP,
   and committed what came out. `.gitignore` had been ignoring those very
   artifacts while they were force-added — added negations.
4. Removed the tracked `sitemap-agent.zip` (stale scaffold-state snapshot of
   this repo, referenced by nothing; recoverable from history) and corrected
   the README, which still claimed the project was scaffold-only.
5. QA'd `visual.html` in a headless browser instead of trusting the string
   assertions, and found the filter box emptied the tree for any non-root
   query. Fixed it (keep ancestors of matches, fade them), extracted the tree
   builder into a testable `buildTreeHtml`, added regression tests, and
   re-rendered the committed visual. See Phase 07's 2026-08-31 findings.
6. Ran the clean-bootstrap sequence in an empty directory and flipped Phase
   10's remaining boxes and the goal acceptance checkbox with evidence.

### Decisions worth keeping

- Example artifacts are **evidence**, so they are deliberately un-ignored and
  regenerable via documented commands, not build output.
- The browser-side tree builder has exactly one implementation, serialized
  into the page with `toString()`, so a test cannot pass against code the
  browser does not run — that gap is what hid the filter bug.

### State left running / open

- All 58 boxes across 10 phases are checked and the goal acceptance checkbox
  is flipped with recorded evidence. The spec set has no remaining work.
- ~~Open follow-up: no `origin` remote, CI never executed.~~ **Closed later
  the same day** — see the 2026-08-31 (continued) entry below.
- `specloop-tasks/bootstrap-preflight-check.md` and the edit to
  `specloop-tasks/README.md` were already in the working tree when this
  session started and are left uncommitted; they target the upstream
  `specloop` CLI, not this repo's spec.

---

## Session: 2026-08-31 (continued, branch `main`)

### Scope of this session

Close the one acceptance follow-up left open: publish to GitHub and prove the
bootstrap and CI against the real remote instead of a local clone path.

### What got done, in order

1. Confirmed the loop had no eligible task left (58/58, acceptance box checked,
   only `_TEMPLATE-phase.md` holds unchecked boxes), so this was user-directed
   work rather than a backlog pick.
2. Scanned the 59 tracked files before publishing: no credentials, no real
   email addresses — only `example.com` placeholders in fixtures and tests.
3. Renamed `master` → `main`, created the public repo
   <https://github.com/khangtoh/sitemap-agent>, and pushed. `gh` was set to the
   SSH protocol with no usable key, so the remote was switched to HTTPS with
   `gh auth setup-git`.
4. CI run 33373779619 succeeded on `ubuntu-latest` — the workflow's first real
   execution. Plain `bun install`, clean `tsc --noEmit`, 23/0 tests, 58/58.
5. Re-ran the full bootstrap from the public HTTPS clone URL: zero
   undocumented steps, crawl produced the expected 7-node graph.
6. Ran down the install caveat properly instead of leaving it as a guess.

### Decisions worth keeping

- Repo is **public**, named `sitemap-agent` (matching the package and binary,
  not the local `sitemapper/` directory), default branch `main`.
- The `TS2688` install workaround is a **host** artifact, now precisely
  diagnosed: bun writes some package files as `.l2s.` symlink stubs that
  resolve into loops, and which package it hits varies per install — a
  cold-cache run mangled `typescript/lib/lib.es2017.object.d.ts` instead of
  `bun-types`, giving completely different, misleading errors. The green CI
  run is the proof it is not a project defect, so the fix stayed in the README
  as a troubleshooting note rather than becoming a code or tsconfig change.

### State left running / open

- Nothing blocking. 58/58 boxes, goal accepted, remote published, CI green.
- Still uncommitted and untouched: `specloop-tasks/bootstrap-preflight-check.md`
  and the edit to `specloop-tasks/README.md`, both pre-existing and aimed at
  the upstream `specloop` CLI rather than this repo's spec.
- If the spec set is ever extended, likely candidates named but not scoped:
  resume/checkpoint end-to-end coverage, a rate-limit/timeout config surface,
  and a human-readable error summary for crawls.

