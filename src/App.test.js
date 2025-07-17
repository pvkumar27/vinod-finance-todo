import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      getSession: jest.fn(() => ({ data: { session: null } }))
    }
  }))
}));

test('renders app without crashing', () => {
  render(<App />);
  // Just verify it renders without crashing
  expect(document.body).toBeDefined();
});