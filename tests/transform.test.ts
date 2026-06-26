import { describe, it, expect } from "vitest";
import { normalizeName, truncateName, addAffix } from "../src/index.js";

describe("normalizeName", () => {
  it("converts to kebab-case by default", () => {
    expect(normalizeName("My Cool App")).toBe("my-cool-app");
  });

  it("converts to camelCase", () => {
    expect(normalizeName("My Cool App", { caseStyle: "camel" })).toBe("myCoolApp");
  });

  it("converts to snake_case", () => {
    expect(normalizeName("My Cool App", { caseStyle: "snake" })).toBe("my_cool_app");
  });

  it("converts to PascalCase", () => {
    expect(normalizeName("My Cool App", { caseStyle: "pascal" })).toBe("MyCoolApp");
  });

  it("converts to lower", () => {
    expect(normalizeName("My Cool App", { caseStyle: "lower" })).toBe("mycoolapp");
  });

  it("converts to upper", () => {
    expect(normalizeName("My Cool App", { caseStyle: "upper" })).toBe("MYCOOLAPP");
  });

  it("truncates with smart strategy", () => {
    expect(normalizeName("My Cool App Name", { maxLength: 10 })).toBe("my-cool");
  });

  it("truncates with hard strategy", () => {
    expect(normalizeName("My Cool App Name", { maxLength: 10, truncation: "hard" })).toBe("my-cool-ap");
  });

  it("returns fallback for empty input", () => {
    expect(normalizeName("")).toBe("app");
    expect(normalizeName("   ")).toBe("app");
    expect(normalizeName("!@#", { fallback: "default" })).toBe("default");
  });

  it("strips special characters to segments", () => {
    expect(normalizeName("hello@world!")).toBe("hello-world");
  });
});

describe("truncateName", () => {
  it("returns unchanged if within maxLen", () => {
    expect(truncateName("hello", 10)).toBe("hello");
  });

  it("smart truncation at word boundary", () => {
    expect(truncateName("my-cool-app-name", 10, "smart")).toBe("my-cool");
  });

  it("smart truncation falls back to hard cut", () => {
    expect(truncateName("abcdefghij", 5, "smart")).toBe("abcde");
  });

  it("hard truncation strips trailing separators", () => {
    expect(truncateName("my-cool-app", 7, "hard")).toBe("my-cool");
  });

  it("handles underscore separators", () => {
    expect(truncateName("my_cool_app_name", 10, "smart")).toBe("my_cool");
  });
});

describe("addAffix", () => {
  it("adds prefix and suffix", () => {
    expect(addAffix("core", { prefix: "my-", suffix: "-app" })).toBe("my-core-app");
  });

  it("adds only prefix", () => {
    expect(addAffix("core", { prefix: "my-" })).toBe("my-core");
  });

  it("adds only suffix", () => {
    expect(addAffix("core", { suffix: "-app" })).toBe("core-app");
  });

  it("truncates base name to fit maxLength", () => {
    expect(addAffix("very-long-name", { prefix: "my-", suffix: "-app", maxLength: 12 })).toBe("my-very-app");
  });

  it("hard truncates when prefix+suffix exceed maxLength", () => {
    const result = addAffix("core", { prefix: "a".repeat(20), suffix: "b".repeat(20), maxLength: 30 });
    expect(result.length).toBeLessThanOrEqual(30);
  });

  it("respects maxLength with no affix", () => {
    expect(addAffix("core", { maxLength: 3 })).toBe("cor");
  });
});
