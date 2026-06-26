export interface WeightedItem<T> {
  item: T;
  weight: number;
}

/** Sample `count` random items from a pool (with replacement). */
export function samplePool<T>(pool: readonly T[], count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)]!);
  }
  return result;
}

/** Sample `count` unique items from a pool (without replacement). */
export function sampleUniquePool<T>(pool: readonly T[], count: number): T[] {
  const copy = [...pool];
  const limit = Math.min(count, copy.length);
  for (let i = 0; i < limit; i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, limit);
}

/** Weighted random pick — returns a single item. */
export function weightedPickPool<T>(items: readonly WeightedItem<T>[]): T | undefined {
  const total = items.reduce((sum, w) => sum + w.weight, 0);
  if (total <= 0) return undefined;
  let r = Math.random() * total;
  for (const wi of items) {
    r -= wi.weight;
    if (r <= 0) return wi.item;
  }
  return items[items.length - 1]?.item;
}

/** Weighted sample — returns `count` items (with replacement). */
export function weightedSamplePool<T>(items: readonly WeightedItem<T>[], count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const pick = weightedPickPool(items);
    if (pick !== undefined) result.push(pick);
  }
  return result;
}

/** Fisher-Yates shuffle. Returns a new array. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandom<T>(pool: readonly T[]): T | undefined {
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}
