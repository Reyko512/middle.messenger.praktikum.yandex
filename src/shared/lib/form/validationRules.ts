import type { ValidatorRule } from './formValidator';

const isString = (v: unknown): v is string => typeof v === 'string';

export const required =
  (message = 'This field is required'): ValidatorRule =>
  (v) =>
    isString(v) ? (v.trim() ? null : message) : v != null ? null : message;

export const personName: ValidatorRule = (v) => {
  if (!isString(v)) return 'Invalid name format';

  const re = /^[A-ZА-ЯЁ][a-zа-яё]+(?:-[A-ZА-ЯЁ][a-zа-яё]+)?$/u;
  return re.test(v)
    ? null
    : 'Must start with a capital letter and contain only letters or hyphen';
};

export const login: ValidatorRule = (v) => {
  if (!isString(v)) return 'Invalid login';

  if (v.length < 3 || v.length > 20)
    return 'Login must be between 3 and 20 characters';

  if (!/^[a-zA-Z0-9_-]+$/.test(v))
    return 'Only latin letters, numbers, "-" and "_" are allowed';

  if (/^\d+$/.test(v)) return 'Login cannot consist of digits only';

  return null;
};

export const email: ValidatorRule = (v) => {
  if (!isString(v)) return 'Invalid email';

  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]+$/.test(v))
    return 'Invalid email format';

  return null;
};

export const password: ValidatorRule<unknown> = (value) => {
  if (!value) return 'Password is required';
  if (typeof value !== 'string') return 'Password shold be a string!';

  if (value.length < 8 || value.length > 40) {
    return 'Password must be between 8 and 40 characters';
  }

  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/\d/.test(value)) {
    return 'Password must contain at least one digit';
  }

  return null;
};

export const phone: ValidatorRule = (v) => {
  if (!isString(v)) return 'Invalid phone number';

  if (!/^\+?\d{10,15}$/.test(v))
    return 'Phone number must contain 10 to 15 digits and may start with +';

  return null;
};

export const messageRule: ValidatorRule = required(
  'Message cannot be empty',
);

export const confirmPasswordRule =
  (passwordField = 'password'): ValidatorRule<unknown> =>
  (value, values) => {
    if (!value) return 'Password confirmation is required';

    if (value !== values[passwordField]) {
      return 'Passwords do not match';
    }

    return null;
  };
