import type { ValidatorRule } from './formValidator';

export const required =
  (message = 'This field is required'): ValidatorRule =>
  (value) =>
    value.trim() ? null : message;

export const personName: ValidatorRule = (value) => {
  const regex =
    /^[A-ZА-ЯЁ][a-zа-яё]+(?:-[A-ZА-ЯЁ][a-zа-яё]+)?$/u;

  return regex.test(value)
    ? null
    : 'Must start with a capital letter and contain only letters or hyphen';
};

export const login: ValidatorRule = (value) => {
  if (value.length < 3 || value.length > 20) {
    return 'Login must be between 3 and 20 characters';
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    return 'Only latin letters, numbers, "-" and "_" are allowed';
  }

  if (/^\d+$/.test(value)) {
    return 'Login cannot consist of digits only';
  }

  return null;
};

export const email: ValidatorRule = (value) => {
  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]+$/.test(value)) {
    return 'Invalid email format';
  }

  return null;
};

export const password: ValidatorRule = (value) => {
  if (!value) {
    return 'Password is required';
  }

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

export const phone: ValidatorRule = (value) => {
  if (!/^\+?\d{10,15}$/.test(value)) {
    return 'Phone number must contain 10 to 15 digits and may start with +';
  }

  return null;
};

export const messageRule: ValidatorRule = required(
  'Message cannot be empty',
);

export const confirmPasswordRule =
  (passwordField = 'password'): ValidatorRule =>
  (value, values) => {
    if (!value) {
      return 'Password confirmation is required';
    }

    if (value !== values[passwordField]) {
      return 'Passwords do not match';
    }

    return null;
  };
