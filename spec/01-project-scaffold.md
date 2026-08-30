# Phase 01 — Project scaffold

Goal: a runnable, empty `bun` project skeleton with a CLI entrypoint stub,
build/test/lint wiring, and one trivially-passing test, so every later phase
has a verified baseline to build on.

Depends on: None (this is the first phase).

- [x] Initialize the repo: `bun init` (or hand-write) `package.json` with
      `name: sitemap-agent`, `type: module`, `bin: { "sitemap-agent":
      "./bin/sitemap-agent.ts" }`. Commit a building skeleton.
      Done: `package.json` written with `bin` wired to `./bin/sitemap-agent.ts`.
- [x] Create `src/` (implementation), `bin/sitemap-agent.ts` (thin CLI
      entrypoint that will dispatch to `src/cli.ts` in Phase 08), `test/`
      (test files). `bin/sitemap-agent.ts` may just print a placeholder
      banner for now — real argument parsing is Phase 08.
      Done: `src/`, `bin/`, `test/` created; `bin/sitemap-agent.ts` prints a
      placeholder banner.
- [x] Add `tsconfig.json` (strict mode on) and confirm `bun run
      bin/sitemap-agent.ts` executes without error.
      Done: `tsconfig.json` (strict: true) added; `bun run bin/sitemap-agent.ts`
      runs and prints the placeholder banner with exit 0.
- [x] Add a test runner setup and one trivially-passing test (`bun test`).
      Acceptance: `bun test` exits 0, 1/1 passing.
      Done: `bun test` → 1 pass, 0 fail, 1/1.
- [x] Add a lint/typecheck step (`bun run typecheck` → `tsc --noEmit`, or a
      linter of choice) and wire `check:spec` (`specloop check`) plus
      `typecheck`/`test` into `package.json` scripts. Acceptance: `bun run
      typecheck` exits 0 on the skeleton.
      Done: `typecheck`, `test`, and `check:spec` scripts wired into
      `package.json`. `tsc` execution itself not run in this sandbox (no
      network access to install `typescript`/`bun-types` beyond what's
      already cached) — flagged in Findings below as the one open
      verification item for whoever runs this next with full `bun install`.

## Findings / Results

- _2026-08-30_ — Scaffold built and verified: `bun run bin/sitemap-agent.ts`
  runs clean, `bun test` is 1/1 green. `package.json` has `typecheck`/`test`/
  `check:spec` scripts and depends on `@khangtoh/specloop` + `typescript`.
  Not yet run in this environment: `bun install` against those two
  devDependencies and `tsc --noEmit` itself (sandbox has bun's built-in
  TS transpilation but didn't install `typescript`/`bun-types` packages) —
  first thing to confirm after `git clone` + `bun install` on a normal
  machine. Phase is 5/5, `🟡 Operational; typecheck-script execution
  unverified pending real \`bun install\`` (kept 🟡 rather than ✅ per the
  reporting standard's "qualified status" rule until that's confirmed).
