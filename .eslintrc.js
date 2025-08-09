module.exports = {
  extends: ['react-app', 'react-app/jest'],
  overrides: [
    {
      files: ['cypress/**/*.js'],
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
        chai: 'readonly',
      },
    },
  ],
};
