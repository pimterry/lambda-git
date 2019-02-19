module.exports = {
  parserOptions: {
    ecmaVersion: 2018
  },
  env: {
    node:true,
    es6:true
  },
  extends: 'eslint:recommended',
  rules: {
    'semi': ["error", "never"],
    'linebreak-style': ['error', 'unix'],
    'global-require': 'error',
    'handle-callback-err': 'error',
    'no-cond-assign': ['error', 'always'],
    'arrow-body-style': 'off',
    'no-console': 'off',
    'no-inner-declarations': 'off',
    'no-redeclare': 'off',
    'no-trailing-spaces': 'error'
  }
}
