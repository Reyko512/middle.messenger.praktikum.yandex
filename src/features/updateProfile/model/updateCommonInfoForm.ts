import type { FormFieldConfig } from '@shared/lib/form/formController';
import type { FormValidator } from '@shared/lib/form/formValidator';
import {
  required,
  personName,
  login,
  phone,
  email,
} from '@shared/lib/form/validationRules';

type UpdateCommonInfoFieldName =
  | 'email'
  | 'login'
  | 'first_name'
  | 'second_name'
  | 'display_name'
  | 'phone';
export type UpdateCommonInfoFormValues = Record<
  UpdateCommonInfoFieldName,
  string
>;

export const inputsUpdateCommonInfo = [
  {
    label: 'email',
    id: 'email',
    name: 'email',
    type: 'text',
    autocomplete: 'email',
    value: '',
  },
  {
    label: 'login',
    id: 'login',
    name: 'login',
    type: 'text',
    autocomplete: 'username',
    value: '',
  },
  {
    label: 'name',
    id: 'first_name',
    name: 'first_name',
    type: 'text',
    autocomplete: 'given-name',
    value: '',
  },
  {
    label: 'last name',
    id: 'second_name',
    name: 'second_name',
    type: 'text',
    autocomplete: 'family-name',
    value: '',
  },
  {
    label: 'nickname',
    id: 'display_name',
    name: 'display_name',
    type: 'text',
    autocomplete: 'nickname',
    value: '',
  },
  {
    label: 'phone',
    id: 'phone',
    name: 'phone',
    type: 'tel',
    autocomplete: 'tel',
    value: '',
  },
 ] as const satisfies readonly FormFieldConfig<UpdateCommonInfoFieldName>[];

export const setValidationRules = (
  value: FormValidator<UpdateCommonInfoFormValues>,
) => {
  value
    .addRule('first_name', required(), personName)
    .addRule('second_name', required(), personName)
    .addRule('login', required(), login)
    .addRule('phone', required(), phone)
    .addRule('email', required(), email)
    .addRule('display_name', required(), login);
};
