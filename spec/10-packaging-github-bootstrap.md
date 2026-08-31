# Phase 10 — Packaging, docs &amp; GitHub bootstrap

Goal: the final acceptance phase — a stranger (or a fresh CI runner) can
`git clone` this repo, install, and get a working crawl + visual with no
undocumented steps, and the repo is `specloop`-clean.

Depends on: Phase 07 (visual representation), Phase 08 (CLI interface),
Phase 09 (tests green) — packaging assumes the product actually works.

- [x] `README.md`: what it is (data-representation-first, not a
      `sitemap.xml` tool), install (`bun add -g` or `bunx`), usage examples
      for `crawl` and `render` mirroring Phase 08's flags, an example
      `sitemap.json` snippet, and a screenshot or description of
      `visual.html`.
- [x] `LICENSE` and a `.gitignore` (node_modules, `sitemap.json`/
      `visual.html` build outputs from local runs, checkpoint files).
- [x] GitHub Actions workflow (`.github/workflows/ci.yml`): on push/PR, run
      `bun install`, `bun run typecheck`, `bun test`, and `specloop check`
      (this repo's own `spec/` must stay green in CI, not just locally).
- [x] End-to-end example run committed as evidence: crawl a small public or
      fixture site, commit (or link to, if large) the resulting
      `sitemap.json` and `visual.html` under an `examples/` directory,
      referenced from the README.
- [x] Clean-bootstrap verification: in a fresh directory, `git clone` this
      repo, run only the documented install + one documented command, and
      confirm it works with zero undocumented manual steps — this is the
      literal "bootstrap into a GitHub repo and run `specloop`-managed
      agents on it" requirement; record the exact commands run as evidence.
- [x] Flip the goal acceptance checkbox in `spec/README.md` once the above
      is true, with the evidence (commands, CI run link, artifact paths)
      recorded there.

## Findings / Results

### 2026-08-30

- README, license, ignores, CI, and local fixture artifacts are present.
- Blocked from the required commit/clean-clone acceptance evidence because
  this supplied workspace has no `.git` metadata or remote clone source.

### 2026-08-31

- The 2026-08-30 blocker is gone: the workspace is now a real Git repository
  (branch `master`, two commits), so commit-based evidence is possible. There
  is still no `origin` remote, so clean-clone proof is taken against the local
  repository path rather than a GitHub URL.
- The previous `examples/fixture/sitemap.json` was hand-authored, not a run
  artifact (`durationMs: 1`, a round `generatedAt`), so it could not serve as
  end-to-end evidence. Replaced with a real run: `examples/fixture/site/` is a
  small static fixture site, `examples/fixture/serve.ts` serves it, and the
  committed `sitemap.json`/`visual.html` are what the CLI actually produced
  crawling it over HTTP — `Pages: 7, Max depth: 2, Errors: 0`, exit 0.
- That run also demonstrates the Phase 02/03 rules against a live server:
  `/private/secret` was skipped per `robots.txt`, the off-domain and `mailto:`
  links were dropped, `?utm_source=` was stripped so `/b/2` stayed one node,
  and the `/#top` fragment link deduped onto `/`.
- `.gitignore` ignored `examples/*/sitemap.json` and `examples/*/visual.html`
  while both were force-added — the example evidence was one `git add` away
  from silently not existing for a cloner. Added explicit negations.
- Removed the tracked `sitemap-agent.zip`: a stale snapshot of the repo at
  scaffold state, referenced by nothing. Recoverable from Git history.
- Environment note (not a project defect): on this host `bun install` produces
  a `node_modules/bun-types` whose files are unresolvable link stubs, so
  `bun run typecheck` fails `TS2688`. `bun install --backend=copyfile` fixes
  it and `tsc --noEmit` is then clean. Documented in the README.
- Clean-bootstrap verification, run against this repository as the clone
  source into an empty directory, using only commands the README/example docs
  state:

  ```
  git clone <repo> bootstrap && cd bootstrap
  bun install --backend=copyfile     # plain `bun install` on hosts without the link issue
  bun run typecheck                  # tsc --noEmit, no output
  bun test                           # 23 pass, 0 fail
  bun run check:spec                 # specloop: structure valid — 10 phases, 58/58
  bun run examples/fixture/serve.ts 8899 &
  bun run bin/sitemap-agent.ts crawl http://127.0.0.1:8899/ \
    --max-depth 3 --delay-ms 0 --output ./sitemap.json --render
  # Pages: 7 / Max depth: 2 / Errors: 0, exit 0; sitemap.json + visual.html written
  ```

  Zero undocumented steps were needed. The one non-obvious step — the
  `--backend=copyfile` install — is a documented host workaround in the
  README, not a hidden requirement.
- Acceptance QA of the visual found and fixed a real filter defect before the
  goal box was flipped — see Phase 07's 2026-08-31 findings.
- Caveat on the clone source: this repository still has no `origin` remote, so
  "fresh machine via `git clone`" is proven against a local clone URL. The
  first push to GitHub should re-run the same sequence against the remote URL;
  nothing in the sequence depends on the clone being local.
