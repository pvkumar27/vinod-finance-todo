/**
 * User Factory - Generate test user data
 * Follows factory pattern for consistent test data creation
 */
class UserFactory {
  /**
   * Create user data with specified type and overrides
   * @param {string} type - User type (admin, premium, standard)
   * @param {Object} overrides - Properties to override
   * @returns {Object} User data object
   */
  static create(type = 'standard', overrides = {}) {
    const timestamp = Date.now();
    const id = Math.floor(Math.random() * 10000);

    const baseUser = {
      id: `Test_E2E_User_${id}`,
      email: `test.user.${id}@example.com`,
      firstName: 'Test',
      lastName: `User${id}`,
      createdAt: new Date().toISOString(),
      ...overrides,
    };

    const userTypes = {
      admin: {
        ...baseUser,
        email: `admin.${id}@example.com`,
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin'],
        subscription: 'enterprise',
      },
      premium: {
        ...baseUser,
        email: `premium.${id}@example.com`,
        role: 'user',
        permissions: ['read', 'write'],
        subscription: 'premium',
        features: ['advanced-analytics', 'priority-support'],
      },
      standard: {
        ...baseUser,
        role: 'user',
        permissions: ['read'],
        subscription: 'free',
        features: ['basic-features'],
      },
    };

    return { ...userTypes[type], ...overrides };
  }

  /**
   * Generate realistic email to avoid conflicts
   * @returns {string} Unique email address
   */
  static generateEmail() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test.e2e.${timestamp}.${random}@example.com`;
  }
}

module.exports = UserFactory;
