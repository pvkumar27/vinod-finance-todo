/**
 * Login Page Object
 * Handles authentication-related interactions
 */
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // Selectors should use data-cy attributes
    this.selectors = {
      emailInput: '[data-cy="auth-email-input"]',
      passwordInput: '[data-cy="auth-password-input"]',
      submitButton: '[data-cy="auth-submit-button"]',
      errorMessage: '[data-cy="auth-error-message"]',
    };
  }

  /**
   * Fill email field
   * @param {string} email - Email address
   * @returns {LoginPage} - For method chaining
   */
  async fillEmail(email) {
    await this.page.fill(this.selectors.emailInput, email);
    return this;
  }

  /**
   * Fill password field
   * @param {string} password - Password
   * @returns {LoginPage} - For method chaining
   */
  async fillPassword(password) {
    await this.page.fill(this.selectors.passwordInput, password);
    return this;
  }

  /**
   * Submit login form
   * @returns {LoginPage} - For method chaining
   */
  async submit() {
    await this.page.click(this.selectors.submitButton);
    return this;
  }

  /**
   * Verify error message is displayed
   * @param {string} expectedMessage - Expected error message
   * @returns {LoginPage} - For method chaining
   */
  async verifyErrorMessage(expectedMessage) {
    await this.page.locator(this.selectors.errorMessage).waitFor({ state: 'visible' });
    const actualMessage = await this.page.textContent(this.selectors.errorMessage);
    if (!actualMessage.includes(expectedMessage)) {
      throw new Error(`Expected error message "${expectedMessage}" but got "${actualMessage}"`);
    }
    return this;
  }

  /**
   * Complete login flow
   * @param {string} email - Email address
   * @param {string} password - Password
   * @returns {LoginPage} - For method chaining
   */
  async login(email, password) {
    await this.fillEmail(email)
      .then(() => this.fillPassword(password))
      .then(() => this.submit());
    return this;
  }
}

module.exports = LoginPage;
