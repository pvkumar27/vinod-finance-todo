// Mock Firebase for testing
export const messaging = {
  // Add mock methods that return resolved promises
  getToken: jest.fn().mockResolvedValue('mock-token'),
  onMessage: jest.fn()
};

export const analytics = {
  logEvent: jest.fn()
};