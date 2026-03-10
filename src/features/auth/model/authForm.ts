import type { FormFieldConfig } from '@shared/lib/form/formController';
import type { FormValidator } from '@shared/lib/form/formValidator';
import {
  login,
  password,
  required,
} from '@shared/lib/form/validationRules';

type AuthFieldName = 'login' | 'password';
export type AuthFormValues = Record<AuthFieldName, string>;

export const inputs = [
  {
    label: 'login',
    id: 'login',
    name: 'login',
    type: 'text',
    autocomplete: 'username',
    value: '',
  },
  {
    label: 'password',
    id: 'password',
    name: 'password',
    type: 'password',
    autocomplete: 'current-password',
    value: '',
  },
 ] as const satisfies readonly FormFieldConfig<AuthFieldName>[];

export const setValidationRules = (value: FormValidator<AuthFormValues>) => {
  value
    .addRule('login', required(), login)
    .addRule('password', required(), password);
};
