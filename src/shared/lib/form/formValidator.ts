export interface FormField {
  name: string;
  value: unknown;
}

export type ValidatorRule<T = unknown> = (value: T) => string | null;

type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export class FormValidator {
  private fields: FormField[];
  private rules: Record<string, ValidatorRule[]>;

  constructor(fields: FormField[]) {
    this.fields = fields;
    this.rules = {};
  }

  public addRule(fieldName: string, rule: ValidatorRule): this {
    if (!this.rules[fieldName]) {
      this.rules[fieldName] = [];
    }

    this.rules[fieldName].push(rule);
    return this;
  }

  public validate(): ValidationResult {
    const errors: Record<string, string> = {};

    for (const field of this.fields) {
      const fieldRules = this.rules[field.name];
      if (!fieldRules) continue;

      for (const rule of fieldRules) {
        const error = rule(field.value);
        if (error) {
          errors[field.name] = error;
          break;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
