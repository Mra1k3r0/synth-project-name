import { describe, it, expect } from "vitest";
import {
  samplePool,
  sampleUniquePool,
  weightedPickPool,
  weightedSamplePool,
  shuffle,
  pickRandom,
} from "../src/index.js";

describe("samplePool", () => {
  it("returns requested count", () => {
    expect(samplePool(["a", "b", "c"], 5)).toHaveLength(5);
  });

  it("returns items from the pool", () => {
    const pool = ["a", "b", "c"];
    const result = samplePool(pool, 10);
    for (const item of result) {
      expect(pool).toContain(item);
    }
  });

  it("returns empty for empty pool", () => {
    expect(samplePool([], 5)).toEqual([]);
  });

  it("returns empty for count 0", () => {
    expect(samplePool(["a", "b"], 0)).toEqual([]);
  });
});

describe("sampleUniquePool", () => {
  it("returns requested count", () => {
    expect(sampleUniquePool(["a", "b", "c", "d"], 2)).toHaveLength(2);
  });

  it("returns unique items", () => {
    const result = sampleUniquePool(["a", "b", "c", "d"], 3);
    expect(new Set(result).size).toBe(3);
  });

  it("returns all items when count > pool length", () => {
    const result = sampleUniquePool(["a", "b"], 5);
    expect(result).toHaveLength(2);
  });

  it("returns empty for empty pool", () => {
    expect(sampleUniquePool([], 5)).toEqual([]);
  });
});

describe("weightedPickPool", () => {
  it("returns an item", () => {
    const result = weightedPickPool([
      { item: "a", weight: 10 },
      { item: "b", weight: 1 },
    ]);
    expect(["a", "b"]).toContain(result);
  });

  it("returns undefined for empty array", () => {
    expect(weightedPickPool([])).toBeUndefined();
  });

  it("returns undefined when all weights are 0", () => {
    expect(weightedPickPool([{ item: "a", weight: 0 }])).toBeUndefined();
  });

  it("prefers higher weight items", () => {
    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 100; i++) {
      const pick = weightedPickPool([
        { item: "a" as const, weight: 100 },
        { item: "b" as const, weight: 1 },
      ]);
      if (pick) counts[pick]++;
    }
    expect(counts.a).toBeGreaterThan(counts.b);
  });
});

describe("weightedSamplePool", () => {
  it("returns requested count", () => {
    const result = weightedSamplePool(
      [
        { item: "a", weight: 10 },
        { item: "b", weight: 1 },
      ],
      5,
    );
    expect(result).toHaveLength(5);
  });

  it("returns empty for empty items", () => {
    expect(weightedSamplePool([], 5)).toEqual([]);
  });
});

describe("shuffle", () => {
  it("returns same length", () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  it("contains all original items", () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it("does not mutate original", () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  it("returns empty for empty array", () => {
    expect(shuffle([])).toEqual([]);
  });
});

describe("pickRandom", () => {
  it("returns an item from the pool", () => {
    const pool = ["a", "b", "c"];
    expect(pool).toContain(pickRandom(pool));
  });

  it("returns undefined for empty pool", () => {
    expect(pickRandom([])).toBeUndefined();
  });
});
