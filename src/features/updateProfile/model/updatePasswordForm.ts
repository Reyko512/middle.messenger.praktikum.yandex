import type { FormFieldConfig } from '@shared/lib/form/formController';
import type { FormValidator } from '@shared/lib/form/formValidator';
import {
  confirmPasswordRule,
  password,
  required,
} from '@shared/lib/form/validationRules';

type UpdatePasswordFieldName =
  | 'oldPassword'
  | 'newPassword'
  | 'confirm-password';
export type UpdatePasswordFormValues = Record<UpdatePasswordFieldName, string>;

export const updatePasswordInputs = [
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
 ] as const satisfies readonly FormFieldConfig<UpdatePasswordFieldName>[];

export const setValidationRules = (
  value: FormValidator<UpdatePasswordFormValues>,
) => {
  value
    .addRule('oldPassword', required(), password)
    .addRule('newPassword', required(), password)
    .addRule(
      'confirm-password',
      required(),
      confirmPasswordRule('newPassword'),
    );
};
