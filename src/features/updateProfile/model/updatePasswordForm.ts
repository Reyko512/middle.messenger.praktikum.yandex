import type { FormValidator } from '@shared/lib/form/formValidator';
import {
  confirmPasswordRule,
  password,
  required,
} from '@shared/lib/form/validationRules';

type Input = {
  label: string;
  id: string;
  name: string;
  type: 'password';
  autocomplete: string;
  value: '';
};

export const updatePasswordInputs: Input[] = [
  {
    label: 'current password',
    id: 'password',
    name: 'oldPassword',
    type: 'password',
    autocomplete: 'current-password',
    value: '',
  },
  {
    label: 'new password',
    id: 'new-password',
    name: 'newPassword',
    type: 'password',
    autocomplete: 'new-password',
    value: '',
  },
  {
    label: 'confirm password',
    id: 'confirm-password',
    name: 'confirm-password',
    type: 'password',
    autocomplete: 'new-password',
    value: '',
  },
];

export const setValidationRules = (value: FormValidator) => {
  value
    .addRule('oldPassword', required(), password)
    .addRule('newPassword', required(), password)
    .addRule(
      'confirm-password',
      required(),
      confirmPasswordRule('newPassword'),
    );
};
