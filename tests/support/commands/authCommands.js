/**
 * Authentication Commands
 * Custom commands for authentication flows
 */

/**
 * Login as specific user type
 * @param {string} userType - Type of user (admin, standard, premium)
 */
function loginAsUserType(page, userType = 'standard') {
  const credentials = {
    admin: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
    standard: { email: process.env.TEST_USER_EMAIL, password: process.env.TEST_USER_PASSWORD },
    premium: { email: process.env.PREMIUM_EMAIL, password: process.env.PREMIUM_PASSWORD },
  };

  const creds = credentials[userType];
  if (!creds) {
    throw new Error(`Unknown user type: ${userType}`);
  }

  return page.evaluate(async ({ email, password }) => {
    // Use cy.session() equivalent for Playwright
    const sessionKey = `auth-${email}`;
    const existingSession = sessionStorage.getItem(sessionKey);

    if (existingSession) {
      return JSON.parse(existingSession);
    }

    // Perform login
    await page.goto('/');
    await page.fill('[data-cy="auth-email-input"]', email);
    await page.fill('[data-cy="auth-password-input"]', password);
    await page.click('[data-cy="auth-submit-button"]');

    // Wait for navigation
    await page.waitForSelector('[data-cy="dashboard-main"]');

    // Store session
    const session = { email, timestamp: Date.now() };
    sessionStorage.setItem(sessionKey, JSON.stringify(session));

    return session;
  }, creds);
}

/**
 * Logout current user
 */
async function logoutUser(page) {
  const logoutButton = page.locator('[data-cy="auth-logout-button"]');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  }

  // Wait for login form
  await page.waitForSelector('[data-cy="auth-email-input"]');
}

/**
 * Verify user is logged in
 */
async function verifyUserLoggedIn(page) {
  await page.waitForSelector('[data-cy="dashboard-main"]', { state: 'visible' });
  const loginForm = page.locator('[data-cy="auth-email-input"]');
  const isLoginVisible = await loginForm.isVisible();

  if (isLoginVisible) {
    throw new Error('User is not logged in - login form is still visible');
  }
}

module.exports = {
  loginAsUserType,
  logoutUser,
  verifyUserLoggedIn,
};
