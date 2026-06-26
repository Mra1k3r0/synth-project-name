import { describe, it, expect } from "vitest";
import {
  createPatternFilter,
  createAllPatternFilter,
  createCompoundFilter,
  negateFilter,
  combineFilters,
} from "../src/index.js";

describe("createPatternFilter", () => {
  it("returns true when any pattern matches", () => {
    const filter = createPatternFilter([/waka/i, /fake/i]);
    expect(filter("wakatime-core")).toBe(true);
    expect(filter("fake-project")).toBe(true);
  });

  it("returns false when no pattern matches", () => {
    const filter = createPatternFilter([/waka/i, /fake/i]);
    expect(filter("my-app")).toBe(false);
  });

  it("handles empty patterns", () => {
    const filter = createPatternFilter([]);
    expect(filter("anything")).toBe(false);
  });
});

describe("createAllPatternFilter", () => {
  it("returns true when all patterns match", () => {
    const filter = createAllPatternFilter([/^my-/, /-app$/]);
    expect(filter("my-cool-app")).toBe(true);
  });

  it("returns false when only some patterns match", () => {
    const filter = createAllPatternFilter([/^my-/, /-app$/]);
    expect(filter("my-cool-core")).toBe(false);
  });

  it("returns false when no patterns match", () => {
    const filter = createAllPatternFilter([/^my-/, /-app$/]);
    expect(filter("your-app")).toBe(false);
  });
});

describe("createCompoundFilter", () => {
  it("passes when all criteria met", () => {
    const filter = createCompoundFilter({
      exclude: [/waka/i],
      minLength: 3,
      maxLength: 20,
    });
    expect(filter("my-app")).toBe(true);
  });

  it("fails on exclude pattern", () => {
    const filter = createCompoundFilter({ exclude: [/waka/i] });
    expect(filter("wakatime")).toBe(false);
  });

  it("fails on minLength", () => {
    const filter = createCompoundFilter({ minLength: 5 });
    expect(filter("ab")).toBe(false);
  });

  it("fails on maxLength", () => {
    const filter = createCompoundFilter({ maxLength: 3 });
    expect(filter("my-app")).toBe(false);
  });

  it("fails on allowedChars", () => {
    const filter = createCompoundFilter({ allowedChars: /^[a-z-]+$/ });
    expect(filter("my_app")).toBe(false);
  });

  it("fails on include pattern", () => {
    const filter = createCompoundFilter({ include: [/^my-/] });
    expect(filter("your-app")).toBe(false);
  });

  it("passes include pattern", () => {
    const filter = createCompoundFilter({ include: [/^my-/] });
    expect(filter("my-app")).toBe(true);
  });

  it("fails on custom filter", () => {
    const filter = createCompoundFilter({ custom: (n) => n.length > 10 });
    expect(filter("ab")).toBe(false);
  });

  it("passes custom filter", () => {
    const filter = createCompoundFilter({ custom: (n) => n.length > 10 });
    expect(filter("my-very-long-app")).toBe(true);
  });
});

describe("negateFilter", () => {
  it("inverts a filter", () => {
    const isSuspicious = createPatternFilter([/waka/i]);
    const isNotSuspicious = negateFilter(isSuspicious);
    expect(isNotSuspicious("wakatime")).toBe(false);
    expect(isNotSuspicious("my-app")).toBe(true);
  });
});

describe("combineFilters", () => {
  it("returns true when all filters pass", () => {
    const filter = combineFilters(createPatternFilter([/^my-/]), (n) => n.length > 3);
    expect(filter("my-app")).toBe(true);
  });

  it("returns false when any filter fails", () => {
    const filter = combineFilters(createPatternFilter([/^my-/]), (n) => n.length > 10);
    expect(filter("my-app")).toBe(false);
  });

  it("handles no filters", () => {
    const filter = combineFilters();
    expect(filter("anything")).toBe(true);
  });
});
