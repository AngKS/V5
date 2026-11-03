import { test } from "node:test";
import assert from "node:assert/strict";
import { formatProjectDate } from "../src/lib/project-date";

test("project dates have stable English spelling and UTC boundaries", () => {
  assert.equal(formatProjectDate("2022-09-11T00:00:00Z"), "11 Sep 2022");
  assert.equal(formatProjectDate("2026-01-01T00:30:00+08:00"), "31 Dec 2025");
  assert.equal(formatProjectDate("invalid"), "Date unavailable");
});
