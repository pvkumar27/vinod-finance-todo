/**
 * Form Component - Reusable form interactions
 * Handles common form operations across the application
 */
class FormComponent {
  constructor(page) {
    this.page = page;
  }

  /**
   * Fill form field by data-cy attribute
   * @param {string} fieldName - data-cy attribute value
   * @param {string} value - Value to fill
   * @returns {FormComponent} - For method chaining
   */
  async fillField(fieldName, value) {
    await this.page.fill(`[data-cy="form-field-${fieldName}"]`, value);
    return this;
  }

  /**
   * Select dropdown option
   * @param {string} fieldName - data-cy attribute value
   * @param {string} option - Option to select
   * @returns {FormComponent} - For method chaining
   */
  async selectDropdown(fieldName, option) {
    await this.page.selectOption(`[data-cy="form-dropdown-${fieldName}"]`, option);
    return this;
  }

  /**
   * Check checkbox
   * @param {string} fieldName - data-cy attribute value
   * @returns {FormComponent} - For method chaining
   */
  async checkCheckbox(fieldName) {
    await this.page.check(`[data-cy="form-checkbox-${fieldName}"]`);
    return this;
  }

  /**
   * Submit form
   * @param {string} formName - Form identifier
   * @returns {FormComponent} - For method chaining
   */
  async submitForm(formName) {
    await this.page.click(`[data-cy="form-submit-${formName}"]`);
    return this;
  }

  /**
   * Verify field error message
   * @param {string} fieldName - Field identifier
   * @param {string} errorMessage - Expected error message
   * @returns {FormComponent} - For method chaining
   */
  async verifyFieldError(fieldName, errorMessage) {
    const errorElement = this.page.locator(`[data-cy="form-error-${fieldName}"]`);
    await errorElement.waitFor({ state: 'visible' });
    const actualError = await errorElement.textContent();

    if (!actualError.includes(errorMessage)) {
      throw new Error(`Expected error "${errorMessage}" but got "${actualError}"`);
    }
    return this;
  }
}

module.exports = FormComponent;
