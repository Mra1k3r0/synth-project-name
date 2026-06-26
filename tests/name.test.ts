import { describe, it, expect } from "vitest";
import {
  matchesAnyPattern,
  generateShortName,
  generateName,
  sanitizeKebabName,
  randomSuffix,
  type NamePools,
  type NameConfig,
} from "../src/index.js";

const pools: NamePools = {
  adjectives: ["fast", "cool", "bold"],
  nouns: ["api", "core", "node"],
};

const config: NameConfig = {
  pools,
  langNouns: {
    TypeScript: ["vault", "prism"],
    Python: ["nova", "glow"],
  },
  fallbackLang: "TypeScript",
};

describe("matchesAnyPattern", () => {
  it("returns true when any pattern matches", () => {
    expect(matchesAnyPattern("wakatime-core", [/waka/i, /fake/i])).toBe(true);
  });

  it("returns false when no pattern matches", () => {
    expect(matchesAnyPattern("my-app", [/waka/i, /fake/i])).toBe(false);
  });

  it("returns false for empty patterns", () => {
    expect(matchesAnyPattern("anything", [])).toBe(false);
  });
});

describe("generateShortName", () => {
  it("returns adj-noun format", () => {
    const name = generateShortName(pools);
    expect(name).toMatch(/^[a-z]+-[a-z]+$/);
  });

  it("uses only words from provided pools", () => {
    for (let i = 0; i < 20; i++) {
      const [adj, noun] = generateShortName(pools).split("-");
      expect(pools.adjectives).toContain(adj);
      expect(pools.nouns).toContain(noun);
    }
  });
});

describe("generateName", () => {
  it("returns adj-noun format", () => {
    const name = generateName(config);
    expect(name).toMatch(/^[a-z]+-[a-z]+$/);
  });

  it("uses language-specific nouns when lang provided", () => {
    for (let i = 0; i < 20; i++) {
      const name = generateName(config, "TypeScript");
      const noun = name.split("-")[1];
      expect(config.langNouns!.TypeScript).toContain(noun);
    }
  });

  it("falls back to fallbackLang when unknown lang", () => {
    for (let i = 0; i < 20; i++) {
      const name = generateName(config, "Zig");
      const noun = name.split("-")[1];
      expect(config.langNouns!.TypeScript).toContain(noun);
    }
  });

  it("falls back to pools.nouns when no fallbackLang and unknown lang", () => {
    const configNoFallback: NameConfig = { pools };
    for (let i = 0; i < 20; i++) {
      const name = generateName(configNoFallback, "Zig");
      const noun = name.split("-")[1];
      expect(pools.nouns).toContain(noun);
    }
  });
});

describe("sanitizeKebabName", () => {
  it("converts to kebab-case", () => {
    expect(sanitizeKebabName("My Cool App")).toBe("my-cool-app");
  });

  it("strips special characters to hyphens", () => {
    expect(sanitizeKebabName("hello@world!")).toBe("hello-world");
  });

  it("truncates to maxLen", () => {
    expect(sanitizeKebabName("a".repeat(50), 10)).toBe("a".repeat(10));
  });

  it("truncates and strips trailing hyphens", () => {
    expect(sanitizeKebabName("hello-world-foo-bar", 6)).toBe("hello");
  });

  it("returns 'app' for empty input", () => {
    expect(sanitizeKebabName("")).toBe("app");
    expect(sanitizeKebabName("   ")).toBe("app");
    expect(sanitizeKebabName("!@#")).toBe("app");
  });

  it("trims whitespace", () => {
    expect(sanitizeKebabName("  hello  ")).toBe("hello");
  });

  it("lowercases", () => {
    expect(sanitizeKebabName("HELLO")).toBe("hello");
  });
});

describe("randomSuffix", () => {
  it("returns hex string of specified length", () => {
    expect(randomSuffix(4)).toMatch(/^[0-9a-f]{4}$/);
    expect(randomSuffix(8)).toMatch(/^[0-9a-f]{8}$/);
  });

  it("defaults to 4 chars", () => {
    expect(randomSuffix()).toHaveLength(4);
  });

  it("produces different values on successive calls", () => {
    const results = new Set(Array.from({ length: 20 }, () => randomSuffix()));
    expect(results.size).toBeGreaterThan(1);
  });
});
