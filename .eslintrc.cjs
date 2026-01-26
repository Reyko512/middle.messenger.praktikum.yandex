/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },

  plugins: ['@typescript-eslint'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/strict-type-checked',
    'prettier',
  ],

  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',

    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/entities/*/*', '**/features/*/*', '**/widgets/*/*'],
            message: 'Импортируй ТОЛЬКО через public API (index.ts)',
          },
        ],
      },
    ],

    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    eqeqeq: 'error',
    'no-implicit-coercion': 'error',
  },

  overrides: [
    {
      files: ['**/*.hbs'],
      rules: {
        'no-inline-comments': 'off',
        'no-restricted-syntax': 'off',
      },
    },
  ],
};
