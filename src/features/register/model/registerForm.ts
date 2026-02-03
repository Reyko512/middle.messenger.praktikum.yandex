import type { FormValidator } from '@shared/lib/form/formValidator';
import {
  required,
  personName,
  login,
  phone,
  email,
  password,
} from '@shared/lib/form/validationRules';

type Input = {
  label: string;
  id: string;
  name: string;
  type: 'password' | 'text' | 'tel';
  autocomplete: string;
  value: '';
};

export const registerFormInputs: Input[] = [
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
];

export const setValidationRules = (value: FormValidator) => {
  value
    .addRule('first_name', required(), personName)
    .addRule('second_name', required(), personName)
    .addRule('login', required(), login)
    .addRule('phone', required(), phone)
    .addRule('email', required(), email)
    .addRule('password', required(), password);
};
