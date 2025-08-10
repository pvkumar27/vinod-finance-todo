/**
 * Input sanitization utilities for security
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = input => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, 1000); // Limit length
};

/**
 * Validates and sanitizes todo task input
 * @param {string} task - Task text to validate
 * @returns {string} - Sanitized task text
 * @throws {Error} - If task is invalid
 */
export const validateTodoTask = task => {
  const sanitized = sanitizeInput(task);

  if (!sanitized || sanitized.length < 1) {
    throw new Error('Task text is required and cannot be empty');
  }

  if (sanitized.length > 500) {
    throw new Error('Task text is too long (max 500 characters)');
  }

  return sanitized;
};

/**
 * Validates credit card name input
 * @param {string} cardName - Card name to validate
 * @returns {string} - Sanitized card name
 */
export const validateCardName = cardName => {
  const sanitized = sanitizeInput(cardName);

  if (sanitized.length > 100) {
    throw new Error('Card name is too long (max 100 characters)');
  }

  return sanitized;
};
