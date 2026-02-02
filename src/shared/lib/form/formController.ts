import { FormValidator, type FormField } from './formValidator';

interface ControlledInput {
  props: {
    name: string;
    value: unknown;
  };
  setProps(next: Record<string, unknown>): void;
}

type InputsMap = Record<string, ControlledInput>;

export class FormController {
  private inputs: InputsMap;
  private validator: FormValidator;

  constructor(inputs: ControlledInput[]) {
    this.inputs = {};

    inputs.forEach((input) => {
      this.inputs[input.props.name] = input;
    });

    this.validator = new FormValidator(this.getFields());
  }

  private getFields(): FormField[] {
    return Object.values(this.inputs).map((input) => ({
      name: input.props.name,
      value: input.props.value,
    }));
  }

  public setRules(configure: (validator: FormValidator) => void) {
    configure(this.validator);
  }

  public updateField(name: string, value: unknown) {
    const input = this.inputs[name];
    if (!input) return;

    input.setProps({ value });

    this.validator = new FormValidator(this.getFields());
  }

  public validate() {
    const result = this.validator.validate();

    Object.entries(this.inputs).forEach(([name, input]) => {
      input.setProps({
        error: result.errors[name] ?? '',
      });
    });

    return result;
  }

  public getValues(): Record<string, unknown> {
    return Object.fromEntries(
      Object.values(this.inputs).map((i) => [i.props.name, i.props.value]),
    );
  }
}
