import React from 'react';
import { render, act } from '@testing-library/react';

// Import App after mocks
import App from './App';

// Mock the supabaseClient module
jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  },
}));

// Mock notifications
jest.mock('./utils/notifications', () => ({
  requestNotificationPermission: () => Promise.resolve('mock-token'),
  setupForegroundMessageListener: () => {},
}));

test('renders App component', async () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
