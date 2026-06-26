import { describe, it, expect } from "vitest";
import { validateName, isValidName } from "../src/index.js";

describe("validateName", () => {
  it("returns valid for name meeting all constraints", () => {
    const result = validateName("my-app", {
      minLength: 3,
      maxLength: 20,
      allowedChars: /^[a-z-]+$/,
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns errors for minLength violation", () => {
    const result = validateName("ab", { minLength: 3 });
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe("minLength");
  });

  it("returns errors for maxLength violation", () => {
    const result = validateName("a".repeat(50), { maxLength: 10 });
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe("maxLength");
  });

  it("returns errors for pattern violation", () => {
    const result = validateName("hello", { pattern: /^my-/ });
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe("pattern");
  });

  it("returns errors for allowedChars violation", () => {
    const result = validateName("my_app", { allowedChars: /^[a-z-]+$/ });
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe("allowedChars");
  });

  it("returns errors for blockPatterns", () => {
    const result = validateName("wakatime-core", { blockPatterns: [/waka/i] });
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe("blockPatterns");
  });

  it("returns errors for requirePatterns", () => {
    const result = validateName("core", { requirePatterns: [/^my-/] });
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe("requirePatterns");
  });

  it("returns errors for prefix violation", () => {
    const result = validateName("my-app", { prefix: "your-" });
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe("prefix");
  });

  it("returns errors for suffix violation", () => {
    const result = validateName("my-app", { suffix: "-core" });
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe("suffix");
  });

  it("returns errors for allowedCases violation", () => {
    const result = validateName("MyApp", { allowedCases: ["kebab"] });
    expect(result.valid).toBe(false);
    expect(result.errors[0].rule).toBe("allowedCases");
  });

  it("passes when allowedCases includes kebab", () => {
    const result = validateName("my-app", { allowedCases: ["kebab"] });
    expect(result.valid).toBe(true);
  });

  it("accumulates multiple errors", () => {
    const result = validateName("ab", {
      minLength: 5,
      maxLength: 100,
      pattern: /^x-/,
      blockPatterns: [/^a/],
    });
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("isValidName", () => {
  it("returns true when valid", () => {
    expect(isValidName("my-app", { minLength: 3 })).toBe(true);
  });

  it("returns false when invalid", () => {
    expect(isValidName("ab", { minLength: 3 })).toBe(false);
  });
});
