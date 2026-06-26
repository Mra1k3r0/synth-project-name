export interface NameConstraints {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedChars?: RegExp;
  blockPatterns?: readonly RegExp[];
  requirePatterns?: readonly RegExp[];
  prefix?: string;
  suffix?: string;
  allowedCases?: readonly ("lower" | "upper" | "camel" | "pascal" | "kebab" | "snake")[];
}

export interface ValidationError {
  rule: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

function detectCase(name: string): string {
  if (/^[a-z]+(-[a-z]+)*$/.test(name)) return "kebab";
  if (/^[a-z]+(_[a-z]+)*$/.test(name)) return "snake";
  if (/^[a-z][a-zA-Z0-9]*$/.test(name)) return "camel";
  if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) return "pascal";
  if (/^[A-Z]+$/.test(name)) return "upper";
  if (/^[a-z]+$/.test(name)) return "lower";
  return "unknown";
}

export function validateName(name: string, constraints: NameConstraints): ValidationResult {
  const errors: ValidationError[] = [];

  if (constraints.minLength !== undefined && name.length < constraints.minLength) {
    errors.push({
      rule: "minLength",
      message: `Name must be at least ${constraints.minLength} characters (got ${name.length})`,
    });
  }

  if (constraints.maxLength !== undefined && name.length > constraints.maxLength) {
    errors.push({
      rule: "maxLength",
      message: `Name must be at most ${constraints.maxLength} characters (got ${name.length})`,
    });
  }

  if (constraints.pattern && !constraints.pattern.test(name)) {
    errors.push({
      rule: "pattern",
      message: `Name must match ${constraints.pattern}`,
    });
  }

  if (constraints.allowedChars) {
    const invalid = name.split("").find((ch) => !constraints.allowedChars!.test(ch));
    if (invalid) {
      errors.push({
        rule: "allowedChars",
        message: `Character '${invalid}' is not allowed`,
      });
    }
  }

  if (constraints.blockPatterns) {
    for (const p of constraints.blockPatterns) {
      if (p.test(name)) {
        errors.push({
          rule: "blockPatterns",
          message: `Name must not match blocked pattern ${p}`,
        });
        break;
      }
    }
  }

  if (constraints.requirePatterns && constraints.requirePatterns.length > 0) {
    const passes = constraints.requirePatterns.some((p) => p.test(name));
    if (!passes) {
      errors.push({
        rule: "requirePatterns",
        message: `Name must match at least one required pattern`,
      });
    }
  }

  if (constraints.prefix && !name.startsWith(constraints.prefix)) {
    errors.push({
      rule: "prefix",
      message: `Name must start with '${constraints.prefix}'`,
    });
  }

  if (constraints.suffix && !name.endsWith(constraints.suffix)) {
    errors.push({
      rule: "suffix",
      message: `Name must end with '${constraints.suffix}'`,
    });
  }

  if (constraints.allowedCases && constraints.allowedCases.length > 0) {
    const detected = detectCase(name);
    if (!constraints.allowedCases.includes(detected as never)) {
      errors.push({
        rule: "allowedCases",
        message: `Name case '${detected}' is not in allowed cases [${constraints.allowedCases.join(", ")}]`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function isValidName(name: string, constraints: NameConstraints): boolean {
  return validateName(name, constraints).valid;
}
