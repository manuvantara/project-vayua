module.exports = {
  arrowParens: 'always',
  bracketSpacing: true,
  // https://github.com/tailwindlabs/prettier-plugin-tailwindcss#installation
  plugins: [require('prettier-plugin-tailwindcss')],
  printWidth: 80,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  // pnpm doesn't support plugin autoloading
  trailingComma: 'all',
};
