/**
 * Generic project name utilities: generation, sanitization, uniqueness tracking.
 * No hardcoded domain data — caller provides patterns, pools, and storage.
 * @packageDocumentation
 */

export {
  generateName,
  generateShortName,
  sanitizeKebabName,
  matchesAnyPattern,
  randomSuffix,
  type NamePools,
  type NameConfig,
} from "./name.js";

export { type NameStore, createMemoryStore, uniqueName, uniqueFromPool } from "./unique.js";

export {
  type NameFilter,
  type CompoundFilterOptions,
  createPatternFilter,
  createAllPatternFilter,
  createCompoundFilter,
  negateFilter,
  combineFilters,
} from "./filter.js";

export {
  type NameConstraints,
  type ValidationError,
  type ValidationResult,
  validateName,
  isValidName,
} from "./validate.js";

export {
  type CaseStyle,
  type NormalizeOptions,
  type TruncationStrategy,
  normalizeName,
  truncateName,
  addAffix,
} from "./transform.js";

export {
  type WeightedItem,
  samplePool,
  sampleUniquePool,
  weightedPickPool,
  weightedSamplePool,
  shuffle,
  pickRandom,
} from "./pool.js";
