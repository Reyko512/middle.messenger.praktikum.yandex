import type { ValidatorRule } from './formValidator';

const isString = (v: unknown): v is string => typeof v === 'string';

const match =
  (regex: RegExp, message: string): ValidatorRule =>
  (value) =>
    isString(value) && regex.test(value) ? null : message;

export const lengthBetween =
  (min: number, max: number, message: string): ValidatorRule =>
  (value) =>
    isString(value) && value.length >= min && value.length <= max
      ? null
      : message;

export const required =
  (message = 'Required'): ValidatorRule =>
  (value) =>
    isString(value) && value.trim() ? null : message;

export const personName: ValidatorRule = match(
  /^[A-ZА-ЯЁ][a-zа-яё]+(?:-[A-ZА-ЯЁ][a-zа-яё]+)?$/,
  'Must contain only letters and start whith capital letter',
);

export const login: ValidatorRule = (value) => {
  if (!isString(value)) return 'Invalid login';

  if (value.length < 3 || value.length > 20)
    return 'Login must be 3–20 characters';

  if (!/^[a-zA-Z0-9_-]+$/.test(value))
    return 'Only latin letters, numbers, "-" and "_" allowed';

  if (/^\d+$/.test(value)) return 'Login cannot consist of digits only';

  return null;
};

export const email: ValidatorRule = match(
  /^[a-zA-Z0-9_-]+@[a-zA-Z]+\.[a-zA-Z]+$/,
  'Invalid email format',
);

export const password: ValidatorRule = (value) => {
  if (!isString(value)) return 'Invalid password';

  if (value.length < 8 || value.length > 40)
    return 'Password must be 8–40 characters';

  if (!/[A-Z]/.test(value))
    return 'Password must contain an uppercase letter';

  if (!/\d/.test(value)) return 'Password must contain a digit';

  return null;
};

export const phone: ValidatorRule = match(
  /^\+?\d{10,15}$/,
  'Phone must contain 10–15 digits',
);

export const message: ValidatorRule = required('Message cannot be empty');
