/**
 * Test Suite Configuration
 *
 * Defines different test suites for various scenarios:
 * - Essential: Critical tests for CI/CD pipeline
 * - Full: Complete test coverage for comprehensive testing
 * - Smoke: Quick smoke tests for rapid feedback
 */

const testSuites = {
  essential: [
    'tests/e2e/essential.spec.js',
    'tests/e2e/core/authentication.spec.js',
    'tests/e2e/core/navigation.spec.js',
  ],

  full: [
    'tests/e2e/essential.spec.js',
    'tests/e2e/core/authentication.spec.js',
    'tests/e2e/core/navigation.spec.js',
    'tests/e2e/todos/todo-crud.spec.js',
    'tests/e2e/credit-cards/credit-card-crud.spec.js',
    'tests/e2e/utils/responsive.spec.js',
  ],

  smoke: ['tests/e2e/essential.spec.js'],

  core: ['tests/e2e/core/authentication.spec.js', 'tests/e2e/core/navigation.spec.js'],

  features: [
    'tests/e2e/todos/todo-crud.spec.js',
    'tests/e2e/credit-cards/credit-card-crud.spec.js',
  ],
};

module.exports = testSuites;
