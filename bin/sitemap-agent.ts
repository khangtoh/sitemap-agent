#!/usr/bin/env bun
declare const process: { argv: string[]; exitCode?: number };
// Thin CLI entrypoint. Real argument parsing and command dispatch land in
// src/cli.ts as part of spec/08-cli-interface-config.md — this stub exists
// so `bun run bin/sitemap-agent.ts` is runnable from Phase 01 onward.
import { runCli } from "../src/cli";
try {
  process.exitCode = await runCli(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
