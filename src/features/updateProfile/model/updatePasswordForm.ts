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
