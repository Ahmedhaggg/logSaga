module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
    '/generated/**/*', // Ignore generated files.
    'jest.config.ts',
  ],
  plugins: ['@typescript-eslint', 'import', 'prettier'], // Add Prettier plugin
  rules: {
    quotes: ['error', 'single'],
    'import/no-unresolved': 0,
    'require-await': 'error', // Ensures that async functions contain an `await`
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-explicit-any': 'error', // or 'warn'

    'require-jsdoc': 0,
    '@typescript-eslint/await-thenable': 'error', // Throws an error if `await` is used on a non-Promise value
  },
};
