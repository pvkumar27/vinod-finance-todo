module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  overrides: [
    {
      files: ['cypress/**/*.js'],
      env: {
        'cypress/globals': true
      },
      extends: [
        'plugin:cypress/recommended'
      ],
      plugins: ['cypress']
    }
  ]
};