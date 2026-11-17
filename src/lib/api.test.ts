// @ts-nocheck -- run with `bun test`; bun:test types are not installed
import { describe, expect, test } from "bun:test";
import { getRecentTopics, matchThenNowTopic, askNavigator, UNSUPPORTED_TOPIC } from "./api";

describe("Then & Now topic matching", () => {
  test("feed algorithm questions match", () => {
    expect(matchThenNowTopic("How did Twitter feed algorithms change visibility?")).toBe("Twitter feed algorithms");
  });
  test("unrelated questions do not match", () => {
    expect(matchThenNowTopic("How do HBCU students use TikTok?")).toBeNull();
  });
});

describe("archive years", () => {
  test("recent topics never come from 2020, 2022 or 2023", async () => {
    for (const y of [2020, 2022, 2023]) expect((await getRecentTopics(y)).topics).toHaveLength(0);
  });
  test("2024 has recent topics", async () => {
    expect((await getRecentTopics(2024)).topics.length).toBeGreaterThan(0);
  });
});

test("unsupported topics return the exact refusal statement", async () => {
  expect((await askNavigator("quantum chromodynamics lattice")).answer).toBe(UNSUPPORTED_TOPIC);
  expect(UNSUPPORTED_TOPIC).toBe("The requested topic is not covered in the available conference records.");
});
