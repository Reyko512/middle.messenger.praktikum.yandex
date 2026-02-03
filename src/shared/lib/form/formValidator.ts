export type ValidatorRule<T = unknown> = (value: T) => string | null;

export class FormValidator {
  private rules: Record<string, ValidatorRule[]> = {};

  public addRule(field: string, ...rules: ValidatorRule[]): this {
    if (!rules.length) return this;

    if (!this.rules[field]) {
      this.rules[field] = [];
    }

    this.rules[field].push(...rules);
    return this;
  }

  private runRules(field: string, value: unknown): string | null {
    const rules = this.rules[field];
    if (!rules) return null;

    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }

    return null;
  }

  public validate(values: Record<string, unknown>) {
    const errors: Record<string, string> = {};

    for (const field of Object.keys(this.rules)) {
      const error = this.runRules(field, values[field]);
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  public validateField(field: string, value: unknown): string | null {
    return this.runRules(field, value);
  }
}
