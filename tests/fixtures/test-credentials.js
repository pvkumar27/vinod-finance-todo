/**
 * Test credentials for authentication
 *
 * IMPORTANT: These credentials should be for a dedicated test account only.
 * Never use real user credentials in automated tests.
 */
module.exports = {
  email: process.env.TEST_USER_EMAIL || 'pvkumar27@yahoo.com',
  password: process.env.TEST_USER_PASSWORD || 'Test1234',
};
