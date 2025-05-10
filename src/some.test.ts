import { expect, test } from "vitest";

test("global id to be 1", () => {
  expect(globalThis.id).toBe("1");
});
test("global id to be 2", () => {
  expect(globalThis.id).toBe("2");
});
