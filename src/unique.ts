import { generateShortName, sanitizeKebabName, randomSuffix, type NamePools } from "./name.js";

export interface NameStore {
  load(): Promise<string[]>;
  save(names: string[]): Promise<void>;
}

export function createMemoryStore(): NameStore {
  const used: string[] = [];
  return {
    async load() {
      return used;
    },
    async save(names) {
      used.length = 0;
      used.push(...names);
    },
  };
}

const MAX_NAMES = 900;

/**
 * Ensure `candidate` is unique by appending random suffixes if needed.
 * @param fallbackPools — Used when `candidate` sanitizes to < 2 chars.
 */
export async function uniqueName(
  store: NameStore,
  candidate: string,
  maxLen = 40,
  fallbackPools?: NamePools,
): Promise<string> {
  const used = new Set(await store.load());
  let base = sanitizeKebabName(candidate, maxLen);
  if (base.length < 2)
    base = fallbackPools
      ? generateShortName(fallbackPools)
      : generateShortName({ adjectives: [base || "app"], nouns: ["x"] });

  if (!used.has(base)) {
    await persist(store, used, base);
    return base;
  }
  for (let i = 0; i < 40; i++) {
    const c = `${base}-${randomSuffix()}`;
    if (!used.has(c)) {
      await persist(store, used, c);
      return c;
    }
  }
  const fallback = `${base}-${Date.now().toString(36)}`;
  await persist(store, used, fallback);
  return fallback;
}

/** Generate a unique name from pools. Tries random picks first, falls back to suffix-based uniqueness. */
export async function uniqueFromPool(store: NameStore, pools: NamePools, maxLen = 40): Promise<string> {
  const used = new Set(await store.load());
  for (let i = 0; i < 72; i++) {
    const n = generateShortName(pools);
    if (!used.has(n)) {
      await persist(store, used, n);
      return n;
    }
  }
  return uniqueName(store, generateShortName(pools), maxLen);
}

async function persist(store: NameStore, used: Set<string>, name: string): Promise<void> {
  used.add(name);
  const list = [...used].slice(-MAX_NAMES);
  await store.save(list);
}
