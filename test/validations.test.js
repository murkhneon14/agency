import test from "node:test";
import assert from "node:assert/strict";
import { projectCreateSchema, projectRequestSchema } from "../lib/validations/schemas.js";

test("project creation requires milestone prices to equal the project total", () => {
  const valid = {
    clientId: "b3a71c3b-9989-4425-a304-40473a8528e7",
    name: "Storefront",
    totalPricePaise: 100_000,
    milestones: [{ title: "Design", pricePaise: 40_000 }, { title: "Build", pricePaise: 60_000 }],
  };
  assert.equal(projectCreateSchema.safeParse(valid).success, true);
  assert.equal(projectCreateSchema.safeParse({ ...valid, totalPricePaise: 99_000 }).success, false);
});

test("project requests reject invalid email addresses and budget categories", () => {
  const base = { name: "Client", email: "client@example.com", service: "Website", budget: "not-sure", timeline: "flexible", description: "Build a site" };
  assert.equal(projectRequestSchema.safeParse(base).success, true);
  assert.equal(projectRequestSchema.safeParse({ ...base, email: "invalid" }).success, false);
  assert.equal(projectRequestSchema.safeParse({ ...base, budget: "infinite" }).success, false);
});
