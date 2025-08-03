import React from 'react';
import { render } from '@testing-library/react';

// Import App after mocks
import App from './App';

// Set up Jest mocks before importing App
// Firebase removed - no mocking needed
jest.mock('./utils/permissionUtils');
jest.mock('./utils/permissionHelper');

// Mock the supabaseClient module
jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  },
}));

// Notification-related mocks removed - files deleted in v3.0.0

// Firebase completely removed - no config needed

test('renders App component', () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
