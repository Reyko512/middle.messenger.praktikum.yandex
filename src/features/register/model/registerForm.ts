import type { FormFieldConfig } from '@shared/lib/form/formController';
import type { FormValidator } from '@shared/lib/form/formValidator';
import {
  required,
  personName,
  login,
  phone,
  email,
  password,
} from '@shared/lib/form/validationRules';

type RegisterFieldName =
  | 'first_name'
  | 'second_name'
  | 'login'
  | 'email'
  | 'phone'
  | 'password';
export type RegisterFormValues = Record<RegisterFieldName, string>;

export const registerFormInputs = [
  {
    label: 'First name',
    id: 'first_name',
    name: 'first_name',
    type: 'text',
    autocomplete: 'given-name',
    value: '',
  },
  {
    label: 'Last name',
    id: 'second_name',
    name: 'second_name',
    type: 'text',
    autocomplete: 'family-name',
    value: '',
  },
  {
    label: 'Login',
    id: 'login',
    name: 'login',
    type: 'text',
    autocomplete: 'username',
    value: '',
  },
  {
    label: 'Email',
    id: 'email',
    name: 'email',
    type: 'text',
    autocomplete: 'email',
    value: '',
  },
  {
    label: 'Phone',
    id: 'phone',
    name: 'phone',
    type: 'tel',
    autocomplete: 'tel',
    value: '',
  },
  {
    label: 'Password',
    id: 'password',
    name: 'password',
    type: 'password',
    autocomplete: 'new-password',
    value: '',
  },
 ] as const satisfies readonly FormFieldConfig<RegisterFieldName>[];

export const setValidationRules = (value: FormValidator<RegisterFormValues>) => {
  value
    .addRule('first_name', required(), personName)
    .addRule('second_name', required(), personName)
    .addRule('login', required(), login)
    .addRule('phone', required(), phone)
    .addRule('email', required(), email)
    .addRule('password', required(), password);
};
