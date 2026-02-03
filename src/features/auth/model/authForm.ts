import type { FormValidator } from '@shared/lib/form/formValidator';
import { login, required } from '@shared/lib/form/validationRules';

type Input = {
  label: string;
  id: string;
  name: string;
  type: 'password' | 'text';
  autocomplete: string;
  value: '';
};

export const inputs: Input[] = [
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
];

export const setValidationRules = (value: FormValidator) => {
  value
    .addRule('login', required(), login)
    .addRule('password', required());
};
