module.exports = {
  arrowParens: 'always',
  bracketSpacing: true,
  jsxSingleQuote: true,
  // https://github.com/tailwindlabs/prettier-plugin-tailwindcss#installation
  // pnpm doesn't support plugin autoloading
  plugins: [require('prettier-plugin-tailwindcss')],
  printWidth: 80,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
};
