import { Input } from '@shared/ui/Input/';
import { FormValidator } from './formValidator';

type FieldConfig = {
  name: string;
  type: string;
  value?: string;
};

export class FormController {
  private values: Record<string, string> = {};
  private validator = new FormValidator();

  public readonly inputs: Input[];

  constructor(fields: FieldConfig[]) {
    this.inputs = fields.map((field) => {
      this.values[field.name] = field.value ?? '';

      const input: Input = new Input({
        ...field,
        value: this.values[field.name] ?? '',
        error: '',
        events: {
          input: (e: Event) => {
            const value = (e.target as HTMLInputElement).value;

            this.values[field.name] = value;
            input.setProps({ value });
          },

          focusout: () => {
            console.log('blured', field.name, field.value);
            this.validateField(field.name);
          },
        },
      });

      return input;
    });
  }

  public addRules(configure: (validator: FormValidator) => void) {
    configure(this.validator);
  }

  public validate() {
    const result = this.validator.validate(this.values);

    this.inputs.forEach((input) => {
      input.setProps({
        error: result.errors[input.props.name as string] ?? '',
      });
    });

    return result;
  }

  private validateField(name: string) {
    const result = this.validator.validateField(name, this.values[name]);
    this.inputs.forEach((input) => {
      if (input.props.name === name) {
        input.setProps({
          error: result ?? '',
        });
      }
    });
  }

  public submit(onValid: (values: Record<string, string>) => void) {
    const result = this.validate();
    if (result.isValid) {
      onValid({ ...this.values });
    }
  }
}
