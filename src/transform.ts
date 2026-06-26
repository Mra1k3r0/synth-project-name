export type CaseStyle = "lower" | "upper" | "camel" | "pascal" | "kebab" | "snake";

export interface NormalizeOptions {
  caseStyle?: CaseStyle;
  maxLength?: number;
  truncation?: "hard" | "smart";
  stripChars?: string;
  fallback?: string;
}

export type TruncationStrategy = "hard" | "smart";

function toKebab(segments: string[]): string {
  return segments.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function toSnake(segments: string[]): string {
  return segments.join("_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}

function toCamel(segments: string[]): string {
  return segments.map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1))).join("");
}

function toPascal(segments: string[]): string {
  return segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
}

function splitIntoSegments(raw: string, stripChars: string): string[] {
  const strip = new RegExp(stripChars, "g");
  return raw
    .toLowerCase()
    .replace(strip, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function normalizeName(raw: string, options: NormalizeOptions = {}): string {
  const {
    caseStyle = "kebab",
    maxLength = 40,
    truncation = "smart",
    stripChars = "[^a-z0-9\\s-]",
    fallback = "app",
  } = options;

  const segments = splitIntoSegments(raw, stripChars);
  if (segments.length === 0) return fallback;

  let result: string;
  switch (caseStyle) {
    case "kebab":
      result = toKebab(segments);
      break;
    case "snake":
      result = toSnake(segments);
      break;
    case "camel":
      result = toCamel(segments);
      break;
    case "pascal":
      result = toPascal(segments);
      break;
    case "lower":
      result = segments.join("").toLowerCase();
      break;
    case "upper":
      result = segments.join("").toUpperCase();
      break;
    default:
      result = toKebab(segments);
  }

  if (result.length > maxLength) {
    result = truncateName(result, maxLength, truncation);
  }

  return result || fallback;
}

/**
 * Truncate a name to `maxLen` characters.
 * `"hard"` — cuts at maxLen, strips trailing separators.
 * `"smart"` — cuts at last word boundary before maxLen.
 */
export function truncateName(name: string, maxLen: number, strategy: TruncationStrategy = "smart"): string {
  if (name.length <= maxLen) return name;

  if (strategy === "smart") {
    const slice = name.slice(0, maxLen);
    const lastSep = Math.max(slice.lastIndexOf("-"), slice.lastIndexOf("_"));
    if (lastSep > 0) {
      return slice.slice(0, lastSep);
    }
  }

  return name.slice(0, maxLen).replace(/[-_]+$/, "");
}

/** Add a prefix and/or suffix to a name, respecting maxLength. */
export function addAffix(name: string, options: { prefix?: string; suffix?: string; maxLength?: number }): string {
  const { prefix = "", suffix = "", maxLength = 40 } = options;
  let result = `${prefix}${name}${suffix}`;
  if (result.length > maxLength) {
    const available = maxLength - prefix.length - suffix.length;
    if (available > 0) {
      const trimmed = truncateName(name, available, "smart");
      result = `${prefix}${trimmed}${suffix}`;
    } else {
      result = truncateName(result, maxLength, "hard");
    }
  }
  return result;
}
