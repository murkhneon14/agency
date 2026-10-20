import test from "node:test";
import assert from "node:assert/strict";
import { calculateProjectProgress, formatINRFromPaise, outstandingBalance } from "../lib/domain/finance.js";

test("outstanding balance uses verified paise and never goes below zero", () => {
  assert.equal(outstandingBalance(1_000_000, 250_000), 750_000);
  assert.equal(outstandingBalance(100, 250), 0);
});

test("project progress is weighted by milestone value", () => {
  assert.equal(calculateProjectProgress([
    { price_paise: 900, work_percent: 100 },
    { price_paise: 100, work_percent: 0 },
  ]), 90);
  assert.equal(calculateProjectProgress([]), 0);
});

test("currency formatting converts paise to rupees", () => {
  assert.match(formatINRFromPaise(125050), /1,250\.50/);
});
