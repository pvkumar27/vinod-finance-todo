/**
 * Base Page Object - Foundation for all page objects
 * Provides common functionality and ensures consistent patterns
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Visit a specific path
   * @param {string} path - Path to visit
   * @returns {BasePage} - For method chaining
   */
  async visit(path = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
    return this;
  }

  /**
   * Wait for page to fully load
   * @returns {BasePage} - For method chaining
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    return this;
  }

  /**
   * Click element with data-cy attribute
   * @param {string} dataCy - data-cy attribute value
   * @returns {BasePage} - For method chaining
   */
  async clickByCy(dataCy) {
    await this.page.click(`[data-cy="${dataCy}"]`);
    return this;
  }

  /**
   * Fill input with data-cy attribute
   * @param {string} dataCy - data-cy attribute value
   * @param {string} value - Value to fill
   * @returns {BasePage} - For method chaining
   */
  async fillByCy(dataCy, value) {
    await this.page.fill(`[data-cy="${dataCy}"]`, value);
    return this;
  }
}

module.exports = BasePage;
