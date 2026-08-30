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
- [ ] End-to-end example run committed as evidence: crawl a small public or
      fixture site, commit (or link to, if large) the resulting
      `sitemap.json` and `visual.html` under an `examples/` directory,
      referenced from the README.
- [ ] Clean-bootstrap verification: in a fresh directory, `git clone` this
      repo, run only the documented install + one documented command, and
      confirm it works with zero undocumented manual steps — this is the
      literal "bootstrap into a GitHub repo and run `specloop`-managed
      agents on it" requirement; record the exact commands run as evidence.
- [ ] Flip the goal acceptance checkbox in `spec/README.md` once the above
      is true, with the evidence (commands, CI run link, artifact paths)
      recorded there.

## Findings / Results

### 2026-08-30

- README, license, ignores, CI, and local fixture artifacts are present.
- Blocked from the required commit/clean-clone acceptance evidence because
  this supplied workspace has no `.git` metadata or remote clone source.
