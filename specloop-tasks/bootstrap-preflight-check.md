# Plan: `specloop` command initialization checks

## Purpose

Extend the **`specloop` CLI command itself** so its initialization path
validates that the working folder is a usable project workspace. This finds
missing Git setup and other bootstrap gaps before the command starts an agent
run or permits work that depends on commit/clone evidence.

## Command behavior

The exact `specloop` command runs these checks during initialization, before
it prints/selects work or starts/resumes an autonomous run.

- When all required checks pass, continue normal command execution.
- When a check can be safely repaired locally, print the condition and the
  exact repair command (for example, `git init`); do not initialize Git
  implicitly.
- When an external capability is missing, exit nonzero with a precise,
  actionable message rather than claiming final acceptance is achievable.

`specloop help` remains informational and skips initialization checks.

## Required checks

1. **Repository root:** verify `AGENTS.md`, `spec/README.md`,
   `spec/BACKLOG.md`, the package manifest, and a green `specloop check`.
2. **Git:** run `git rev-parse --is-inside-work-tree`; verify local author
   configuration, current branch, working-tree state, and an `origin` remote
   when the goal requires clean-clone proof.
3. **Runtime:** verify Bun, install dependencies, and run documented
   typecheck/tests; distinguish cache/environment errors from project errors.
4. **Spec state:** read the backlog, phase index, ledger, and run state;
   recount checkboxes and identify the goal acceptance path.
5. **Artifacts:** verify workspace/output locations are writable and have the
   intended tracked/ignored policy.

## Preflight report

| Check | Result | Action |
|---|---|---|
| Git repository | Pass / warning / blocked | Exact command or decision needed |
| Runtime and dependencies | Pass / blocked | Exact failing command and cause |
| Spec structure | Pass / blocked | Relevant phase or file |
| Goal acceptance path | Pass / warning | Remaining phases/checklist evidence |

Append a ledger entry only when preflight changes a decision, initializes a
repository, or leaves a resume/blocker state.

## Acceptance criteria

- Exact `specloop` performs the checks in its CLI initialization code before
  selecting work.
- Missing Git setup is explicit and cannot be silently ignored.
- Goals needing clean-clone proof detect a missing clone source early.
- A healthy workspace automatically continues into the existing command flow.
- A failed check returns an actionable CLI error; agent blocked-state policy
  applies only after the command has actually started an agent run.
- The behavior is implemented and tested in the specloop CLI package, then
  documented in its command help/release notes; repository `AGENTS.md` should
  only describe the resulting user-facing contract.
