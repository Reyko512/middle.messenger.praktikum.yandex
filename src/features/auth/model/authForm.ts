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
