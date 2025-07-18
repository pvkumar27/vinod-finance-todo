/**
 * Test credentials for authentication
 *
 * IMPORTANT: These credentials should be for a dedicated test account only.
 * Never use real user credentials in automated tests.
 */
module.exports = {
  email: process.env.TEST_USER_EMAIL,
  password: process.env.TEST_USER_PASSWORD,

  // Validate credentials are available
  validate: function () {
    if (!this.email || !this.password) {
      throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables must be set');
    }
  },
};
