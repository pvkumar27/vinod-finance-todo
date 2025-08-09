module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  overrides: [
    {
      files: ['cypress/**/*.js'],
      plugins: ['cypress'],
      env: {
        'cypress/globals': true
      },
      extends: [
        'plugin:cypress/recommended'
      ]
    }
  ]
};