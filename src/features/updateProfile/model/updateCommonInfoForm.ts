import type { FormValidator } from '@shared/lib/form/formValidator';
import {
  required,
  personName,
  login,
  phone,
  email,
} from '@shared/lib/form/validationRules';

type Input = {
  label: string;
  id: string;
  name: string;
  type: 'text' | 'tel';
  autocomplete: string;
  value: '';
};

export const inputsUpdateCommonInfo: Input[] = [
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
];

export const setValidationRules = (value: FormValidator) => {
  value
    .addRule('first_name', required(), personName)
    .addRule('second_name', required(), personName)
    .addRule('login', required(), login)
    .addRule('phone', required(), phone)
    .addRule('email', required(), email)
    .addRule('display_name', required(), login);
};
