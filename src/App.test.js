import React from 'react';
import { render } from '@testing-library/react';

// Mock the supabaseClient module
jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }
}));

// Mock notifications
jest.mock('./utils/notifications', () => ({
  requestNotificationPermission: () => Promise.resolve('mock-token'),
  setupForegroundMessageListener: () => {}
}));

// Import App after mocks
import App from './App';

test('renders loading screen initially', () => {
  const { getByText } = render(<App />);
  expect(getByText(/loading/i)).toBeInTheDocument();
});