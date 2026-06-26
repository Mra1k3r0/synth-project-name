# synth-project-name

> Zero-config project name generation, validation, and uniqueness tracking.

Generate `adj-noun` names from your own pools, validate against constraints, track uniqueness — all without hardcoded data.

---

## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [Modules](#modules)
  - [Generate](#generate)
  - [Uniqueness](#uniqueness)
  - [Filtering](#filtering)
  - [Validation](#validation)
  - [Transform](#transform)
  - [Sampling](#sampling)
- [API Reference](#api-reference)
- [License](#license)

---

## Install

```bash
npm install synth-project-name
```

---

## Quick Start

```ts
import { uniqueFromPool, createMemoryStore } from "synth-project-name";

const store = createMemoryStore();
const name = await uniqueFromPool(store, {
  adjectives: ["fast", "cool", "bold"],
  nouns: ["api", "core", "node"],
});

// → "bold-core"
```

---

## Modules

### Generate

Generate `adj-noun` names from caller-provided pools. Supports language-specific noun overrides.

```ts
import { generateName, generateShortName, sanitizeKebabName, randomSuffix } from "synth-project-name";

const pools = { adjectives: ["fast", "cool"], nouns: ["api", "core"] };

generateShortName(pools);
// → "fast-core"

generateName(
  { pools, langNouns: { TypeScript: ["vault", "prism"] }, fallbackLang: "TypeScript" },
  "TypeScript"
);
// → "cool-vault"

sanitizeKebabName("My Cool App!");
// → "my-cool-app"

randomSuffix(4);
// → "a3f1"
```

---

### Uniqueness

Track used names via a pluggable `NameStore` interface. Built-in memory store for testing.

```ts
import { uniqueName, uniqueFromPool, createMemoryStore } from "synth-project-name";

const store = createMemoryStore();

await uniqueName(store, "my-app");
// → "my-app"

await uniqueName(store, "my-app");
// → "my-app-3a7f"
```

| Function | Description |
|---|---|
| `uniqueName(store, candidate)` | Returns `candidate` if unique, appends suffix otherwise |
| `uniqueFromPool(store, pools)` | Random pick from pool, falls back to suffix on collision |
| `createMemoryStore()` | In-memory store for tests |

---

### Filtering

Composable pattern-based filters with `negate`, `combine`, and `compound` modes.

```ts
import { createCompoundFilter, negateFilter } from "synth-project-name";

const isSuspicious = createCompoundFilter({
  exclude: [/internal/i, /debug/i],
  minLength: 5,
  allowedChars: /^[a-z0-9-]+$/,
});

isSuspicious("my-app");     // → true
isSuspicious("internal-x"); // → false

const isClean = negateFilter(isSuspicious);
```

| Function | Logic |
|---|---|
| `createPatternFilter(patterns)` | **any** pattern matches |
| `createAllPatternFilter(patterns)` | **all** patterns match |
| `createCompoundFilter(opts)` | include → exclude → length → chars → custom |
| `negateFilter(filter)` | Inverts result |
| `combineFilters(...filters)` | AND logic |

---

### Validation

Constraint-based validation with structured error reporting.

```ts
import { validateName, isValidName } from "synth-project-name";

isValidName("my-app", { minLength: 3, allowedChars: /^[a-z-]+$/ });
// → true

validateName("ab", { minLength: 3 });
// → { valid: false, errors: [{ rule: "minLength", message: "..." }] }
```

**Supported constraints:**

| Constraint | Type | Description |
|---|---|---|
| `minLength` | `number` | Minimum character count |
| `maxLength` | `number` | Maximum character count |
| `pattern` | `RegExp` | Must match |
| `allowedChars` | `RegExp` | Every character must pass |
| `blockPatterns` | `RegExp[]` | Must not match any |
| `requirePatterns` | `RegExp[]` | Must match at least one |
| `prefix` | `string` | Must start with |
| `suffix` | `string` | Must end with |
| `allowedCases` | `string[]` | `kebab`, `snake`, `camel`, `pascal`, `upper`, `lower` |

---

### Transform

Case conversion, smart truncation, and prefix/suffix helpers.

```ts
import { normalizeName, truncateName, addAffix } from "synth-project-name";

normalizeName("My Cool App", { caseStyle: "camel" });
// → "myCoolApp"

truncateName("my-cool-app-name", 10, "smart");
// → "my-cool"

addAffix("core", { prefix: "my-", suffix: "-app" });
// → "my-core-app"
```

| Case Style | Input | Output |
|---|---|---|
| `kebab` | `My Cool App` | `my-cool-app` |
| `snake` | `My Cool App` | `my_cool_app` |
| `camel` | `My Cool App` | `myCoolApp` |
| `pascal` | `My Cool App` | `MyCoolApp` |
| `lower` | `My Cool App` | `mycoolapp` |
| `upper` | `My Cool App` | `MYCOOLAPP` |

---

### Sampling

Random sampling, weighted picks, and shuffling.

```ts
import { samplePool, weightedPickPool, shuffle } from "synth-project-name";

samplePool(["a", "b", "c"], 2);
// → ["c", "a"]

weightedPickPool([
  { item: "a", weight: 10 },
  { item: "b", weight: 1 },
]);
// → "a" (91% probability)

shuffle([1, 2, 3]);
// → [2, 3, 1] (random order)
```

| Function | Description |
|---|---|
| `samplePool(pool, count)` | Sample with replacement |
| `sampleUniquePool(pool, count)` | Sample without replacement |
| `weightedPickPool(items)` | Weighted single pick |
| `weightedSamplePool(items, count)` | Weighted with replacement |
| `shuffle(arr)` | Fisher-Yates shuffle |
| `pickRandom(pool)` | Single random pick |

---

## API Reference

All exports and type definitions are in [`src/index.ts`](src/index.ts). See source for full type signatures.

---

## License

[MIT](LICENSE) © [mra1k3r0](https://github.com/Mra1k3r0)
