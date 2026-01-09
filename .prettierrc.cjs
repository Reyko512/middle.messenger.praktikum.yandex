module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',

  objectWrap: 'preserve',
  proseWrap: 'preserve',

  overrides: [
    {
      files: ['*.hbs', '*.handlebars'],
      options: {
        parser: 'glimmer',
      },
    },
  ],
};