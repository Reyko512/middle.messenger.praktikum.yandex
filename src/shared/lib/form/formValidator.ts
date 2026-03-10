export type FormValuesMap = Record<string, string>;

export type ValidatorRule<TValues extends FormValuesMap = FormValuesMap> = (
  value: string,
  values: TValues,
) => string | null;

export interface ValidationResult<TValues extends FormValuesMap> {
  isValid: boolean;
  errors: Partial<Record<keyof TValues, string>>;
}

export class FormValidator<TValues extends FormValuesMap = FormValuesMap> {
  private rules: Partial<Record<keyof TValues, ValidatorRule<TValues>[]>> = {};

  public addRule(
    field: keyof TValues,
    ...rules: ValidatorRule<TValues>[]
  ): this {
    if (!rules.length) {
      return this;
    }

    const currentRules = this.rules[field] ?? [];
    this.rules[field] = [...currentRules, ...rules];
    return this;
  }

  private runRules(field: keyof TValues, values: TValues): string | null {
    const rules = this.rules[field];
    if (!rules) {
      return null;
    }

    const value = values[field] ?? '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) {
        return error;
      }
    }

    return null;
  }

  public validate(values: TValues): ValidationResult<TValues> {
    const errors: Partial<Record<keyof TValues, string>> = {};

    (Object.keys(this.rules) as Array<keyof TValues>).forEach((field) => {
      const error = this.runRules(field, values);
      if (error) {
        errors[field] = error;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  public validateField(field: keyof TValues, values: TValues) {
    return this.runRules(field, values);
  }
}
