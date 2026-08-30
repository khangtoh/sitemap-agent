# Plan: autonomous `specloop` command

## Desired behavior

When a user sends the command **exactly**:

```text
specloop
```

Codex or Claude must set the repository's goal to completing every numbered
spec phase and continue working autonomously until one of these terminal
conditions occurs:

1. every acceptance checkbox required by the goal is checked with recorded
   evidence;
2. a genuine blocker requires user input or an external state change; or
3. the user sends an instruction to stop, pause, or replace the work.

It must not stop simply because it completed one checkbox or one phase.

## Implementation plan

1. Update the repository agent instructions (`AGENTS.md`) with an explicit
   command contract for the exact `specloop` message.
   - Define it as a **goal run**, not a standard one-phase run.
   - Map its goal to the top-level acceptance checkbox in `spec/README.md`.
   - State that the loop spans all eligible phases until the terminal
     conditions above.

2. Retain a separate behavior for ordinary, non-command repository work.
   - An agent performing a normal task may finish its requested scope.
   - `specloop help` remains informational and must not start a run.
   - Variants such as `specloop start` should either be explicitly accepted
     as an alias or explicitly rejected/documented; choose one and test it.

3. Add a durable run-state record, for example
   `spec/specloop-run-state.md`.
   - Record whether an autonomous goal run is active, its stated goal, the
     top-level acceptance checkbox, current phase/task, and resume point.
   - Update it after each completed task and when a run pauses or blocks.
   - Make the record advisory only: actual completion remains derived from
     checklist evidence, not from this state file.

4. Define the operational loop in the instructions.
   - Read `spec/BACKLOG.md` and choose the highest-ranked phase with
     satisfied dependencies.
   - Within that phase, choose the highest-priority unchecked task.
   - Implement, test, update the task checkbox and Findings/Results,
     reconcile `spec/README.md`, append the session ledger when required,
     run `specloop check`, and commit when Git metadata is available.
   - Immediately select the next eligible task; do not hand control back
     merely because the current phase reached 100%.

5. Specify stop and interruption semantics.
   - A direct user instruction supersedes the run immediately.
   - A status question receives a concise status response, then the run
     continues unless the user says stop.
   - A blocker must name the missing decision or external state and leave a
     resume point in the ledger/state record.
   - Never claim completion due to elapsed time, token budget, or a phase
     boundary.

6. Add acceptance tests or a checklist-based verification fixture for the
   agent contract.
   - Verify exact `specloop` selects the repository goal acceptance checkbox.
   - Verify completion of a phase causes the next eligible phase to begin.
   - Verify `specloop help` does not start a run.
   - Verify an explicit stop instruction halts further work and preserves the
     resume state.
   - Verify `specloop check` still validates the changed spec layout.

7. Document the behavior in the root README.
   - Show the exact command, what it authorizes, how to stop it, and the
     terminal conditions.
   - Make clear that the command applies to an agent session, rather than a
     shell executable named `specloop`.

## Definition of done

- The exact `specloop` command reliably begins/resumes a goal run spanning all
  specs through the goal acceptance checkbox.
- The agent does not stop at task or phase boundaries without a terminal
  condition.
- Stop, interruption, blocker, and resume behavior are documented and tested.
- The spec checker remains green and the instructions, README, run-state
  record, and ledger agree.
