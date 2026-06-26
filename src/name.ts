import crypto from "node:crypto";

/** Adjective + noun pools. Caller provides their own lists. */
export type NamePools = {
  adjectives: readonly string[];
  nouns: readonly string[];
};

export type NameConfig = {
  pools: NamePools;
  langNouns?: Record<string, readonly string[]>;
  /**
   * Language key to fall back to when `lang` is provided but not found in `langNouns`.
   * If not set, falls back to `pools.nouns`.
   */
  fallbackLang?: string;
  maxLength?: number;
};

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function matchesAnyPattern(name: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((p) => p.test(name));
}

export function generateShortName(pools: NamePools): string {
  return `${pick(pools.adjectives)}-${pick(pools.nouns)}`;
}

/** Generate `adj-noun` with optional language-specific noun override. */
export function generateName(config: NameConfig, lang?: string): string {
  const adj = pick(config.pools.adjectives);
  const nouns =
    lang && config.langNouns?.[lang]
      ? config.langNouns[lang]
      : config.fallbackLang && config.langNouns?.[config.fallbackLang]
        ? config.langNouns[config.fallbackLang]
        : config.pools.nouns;
  const noun = pick(nouns);
  return `${adj}-${noun}`;
}

export function sanitizeKebabName(raw: string, maxLen = 40): string {
  let s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s.length > maxLen) s = s.slice(0, maxLen).replace(/-+$/g, "");
  return s || "app";
}

/** Random hex suffix using crypto-grade randomness. */
export function randomSuffix(len = 4): string {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex")
    .slice(0, len);
}
