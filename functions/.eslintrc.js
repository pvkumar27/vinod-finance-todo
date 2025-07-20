module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    quotes: ['error', 'single'],
    'max-len': ['warn', { code: 100 }],
    'no-unused-vars': 'warn',
    indent: ['error', 2],
  },
};
