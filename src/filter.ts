export type NameFilter = (name: string) => boolean;

export interface CompoundFilterOptions {
  include?: readonly RegExp[];
  exclude?: readonly RegExp[];
  minLength?: number;
  maxLength?: number;
  allowedChars?: RegExp;
  custom?: NameFilter;
}

/** Create a filter that returns true when `name` matches **any** of the given patterns. */
export function createPatternFilter(patterns: readonly RegExp[]): NameFilter {
  return (name: string) => patterns.some((p) => p.test(name));
}

/** Create a filter that returns true when `name` matches **all** of the given patterns. */
export function createAllPatternFilter(patterns: readonly RegExp[]): NameFilter {
  return (name: string) => patterns.every((p) => p.test(name));
}

/**
 * Create a compound filter from multiple criteria.
 * Evaluation order: include → exclude → length → allowedChars → custom.
 */
export function createCompoundFilter(options: CompoundFilterOptions): NameFilter {
  const { include = [], exclude = [], minLength, maxLength, allowedChars, custom } = options;

  const includeFilter = include.length > 0 ? createAllPatternFilter(include) : null;
  const excludeFilter = exclude.length > 0 ? createPatternFilter(exclude) : null;

  return (name: string): boolean => {
    if (includeFilter && !includeFilter(name)) return false;
    if (excludeFilter && excludeFilter(name)) return false;
    if (minLength !== undefined && name.length < minLength) return false;
    if (maxLength !== undefined && name.length > maxLength) return false;
    if (allowedChars && !allowedChars.test(name)) return false;
    if (custom && !custom(name)) return false;
    return true;
  };
}

/** Negate any filter — returns the inverse. */
export function negateFilter(filter: NameFilter): NameFilter {
  return (name: string) => !filter(name);
}

/** Combine multiple filters with AND logic. */
export function combineFilters(...filters: readonly NameFilter[]): NameFilter {
  return (name: string) => filters.every((f) => f(name));
}
