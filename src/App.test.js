import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loading screen initially', () => {
  render(<App />);
  const loadingElement = screen.getByText(/loading/i);
  expect(loadingElement).toBeInTheDocument();
});
