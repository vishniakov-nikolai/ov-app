module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    './.eslintrc-global.js',
  ],
  ignorePatterns: ['**/*.js', 'node_modules/', 'types/', 'renderer/'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
};