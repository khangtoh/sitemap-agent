import { test, expect } from "bun:test";

// Phase 01 acceptance: one trivially-passing test so `bun test` is green
// on the bare scaffold. Replace/extend as each phase adds real coverage.
test("scaffold builds and the test runner works", () => {
  expect(1 + 1).toBe(2);
});
