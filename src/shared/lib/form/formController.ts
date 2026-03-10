import { Input } from '@shared/ui/Input/';
import type { InputProps } from '@shared/ui/Input/';
import { FormValidator } from './formValidator';

export interface FormFieldConfig<TName extends string>
  extends Pick<InputProps, 'autocomplete' | 'className' | 'id' | 'type'> {
  label: string;
  name: TName;
  value?: string;
}

type FieldName<TFields extends readonly FormFieldConfig<string>[]> =
  TFields[number]['name'];

export type FormValues<TFields extends readonly FormFieldConfig<string>[]> = {
  [TField in TFields[number] as TField['name']]: string;
};

function createFormValues<TFields extends readonly FormFieldConfig<string>[]>(
  fields: TFields,
): FormValues<TFields> {
  return Object.fromEntries(
    fields.map((field) => [field.name, field.value ?? '']),
  ) as FormValues<TFields>;
}

function getFieldValue(event: Event) {
  const target = event.target;

  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    return target.value;
  }

  return null;
}

export class FormController<TFields extends readonly FormFieldConfig<string>[]> {
  private values: FormValues<TFields>;
  private validator = new FormValidator<FormValues<TFields>>();

  public readonly inputs: Input[];

  constructor(fields: TFields) {
    this.values = createFormValues(fields);

    this.inputs = fields.map((field) => {
      const fieldName = field.name as FieldName<TFields>;
      const input = new Input({
        ...field,
        value: this.values[fieldName] as string,
        error: '',
        events: {
          input: (event) => {
            const value = getFieldValue(event);

            if (value === null) {
              return;
            }

            this.values[fieldName] = value as FormValues<TFields>[typeof fieldName];
            input.setProps({ value });
          },
          focusout: () => {
            this.validateField(fieldName);
          },
        },
      });

      return input;
    });
  }

  public addRules(
    configure: (validator: FormValidator<FormValues<TFields>>) => void,
  ) {
    configure(this.validator);
  }

  public validate() {
    const result = this.validator.validate(this.values);

    this.inputs.forEach((input) => {
      const fieldName = input.props.name as keyof FormValues<TFields>;
      input.setProps({
        error: result.errors[fieldName] ?? '',
      });
    });

    return result;
  }

  private validateField(field: keyof FormValues<TFields>) {
    const result = this.validator.validateField(field, this.values);

    this.inputs.forEach((input) => {
      if (input.props.name === field) {
        input.setProps({
          error: result ?? '',
        });
      }
    });
  }

  public async submit(
    onValid: (values: FormValues<TFields>) => Promise<void> | void,
  ) {
    const result = this.validate();

    if (result.isValid) {
      await onValid({ ...this.values });
    }
  }

  public getValues() {
    return { ...this.values };
  }

  public setValues(nextValues: Partial<FormValues<TFields>>) {
    Object.entries(nextValues).forEach(([name, value]) => {
      if (typeof value !== 'string') {
        return;
      }

      const fieldName = name as keyof FormValues<TFields>;
      this.values[fieldName] = value as FormValues<TFields>[typeof fieldName];
      const input = this.inputs.find((item) => item.props.name === name);

      if (!input) {
        return;
      }

      input.setProps({
        value,
        error: '',
      });
    });
  }

  public clear() {
    (Object.keys(this.values) as Array<keyof FormValues<TFields>>).forEach(
      (name) => {
        this.values[name] = '' as FormValues<TFields>[typeof name];
      },
    );

    this.inputs.forEach((input) => {
      input.setProps({
        value: '',
        error: '',
      });
    });
  }
}
