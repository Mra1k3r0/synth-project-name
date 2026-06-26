import { describe, it, expect } from "vitest";
import { createMemoryStore, uniqueName, uniqueFromPool, type NamePools } from "../src/index.js";

const pools: NamePools = {
  adjectives: ["fast", "cool", "bold", "calm", "dark"],
  nouns: ["api", "core", "node", "edge", "grid"],
};

describe("createMemoryStore", () => {
  it("starts with empty list", async () => {
    const store = createMemoryStore();
    expect(await store.load()).toEqual([]);
  });

  it("persists and loads", async () => {
    const store = createMemoryStore();
    await store.save(["a", "b"]);
    expect(await store.load()).toEqual(["a", "b"]);
  });

  it("replaces on save", async () => {
    const store = createMemoryStore();
    await store.save(["a", "b"]);
    await store.save(["c"]);
    expect(await store.load()).toEqual(["c"]);
  });
});

describe("uniqueName", () => {
  it("returns candidate when unique", async () => {
    const store = createMemoryStore();
    const result = await uniqueName(store, "my-app");
    expect(result).toBe("my-app");
  });

  it("appends suffix when candidate exists", async () => {
    const store = createMemoryStore();
    await store.save(["my-app"]);
    const result = await uniqueName(store, "my-app");
    expect(result).toMatch(/^my-app-[0-9a-f]{4}$/);
  });

  it("persists the result", async () => {
    const store = createMemoryStore();
    await uniqueName(store, "my-app");
    expect(await store.load()).toContain("my-app");
  });

  it("returns unique names across multiple calls", async () => {
    const store = createMemoryStore();
    const names = new Set<string>();
    for (let i = 0; i < 10; i++) {
      names.add(await uniqueName(store, "my-app"));
    }
    expect(names.size).toBe(10);
  });

  it("uses fallbackPools when base < 2 chars", async () => {
    const store = createMemoryStore();
    const result = await uniqueName(store, "x", 40, pools);
    expect(result).toMatch(/^[a-z]+-[a-z]+$/);
  });

  it("uses minimal fallback when no fallbackPools", async () => {
    const store = createMemoryStore();
    const result = await uniqueName(store, "x");
    expect(result).toMatch(/^[a-z]+-[a-z]+$/);
  });

  it("respects maxLen", async () => {
    const store = createMemoryStore();
    const result = await uniqueName(store, "a".repeat(50), 10);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("handles empty string", async () => {
    const store = createMemoryStore();
    const result = await uniqueName(store, "");
    expect(result).toBe("app");
  });
});

describe("uniqueFromPool", () => {
  it("returns a name from the pools", async () => {
    const store = createMemoryStore();
    const result = await uniqueFromPool(store, pools);
    const [adj, noun] = result.split("-");
    expect(pools.adjectives).toContain(adj);
    expect(pools.nouns).toContain(noun);
  });

  it("returns unique names across calls", async () => {
    const store = createMemoryStore();
    const names = new Set<string>();
    for (let i = 0; i < 10; i++) {
      names.add(await uniqueFromPool(store, pools));
    }
    expect(names.size).toBe(10);
  });

  it("persists each result", async () => {
    const store = createMemoryStore();
    for (let i = 0; i < 5; i++) {
      await uniqueFromPool(store, pools);
    }
    const loaded = await store.load();
    expect(loaded.length).toBe(5);
  });

  it("falls back to suffix uniqueness when pool exhausted", async () => {
    const smallPools: NamePools = { adjectives: ["a"], nouns: ["b"] };
    const store = createMemoryStore();
    const names: string[] = [];
    for (let i = 0; i < 5; i++) {
      names.push(await uniqueFromPool(store, smallPools));
    }
    expect(names[0]).toBe("a-b");
    expect(names.length).toBe(5);
    expect(new Set(names).size).toBe(5);
  });
});
