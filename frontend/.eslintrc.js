module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  rules: {},
  ignorePatterns: [
    'node_modules',
    'build',
    'dist',
    '*.config.js'
  ]
};

