import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the supabaseClient module before importing App
jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      getSession: jest.fn(() => ({ data: { session: null } }))
    }
  }
}));

// Now import App after the mock is set up
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // Just verify it renders without crashing
  expect(document.body).toBeDefined();
});