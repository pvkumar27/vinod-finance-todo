import React, { act } from 'react';
import { render } from '@testing-library/react';

// Set up Jest mocks before importing App
jest.mock('./firebase-config');
jest.mock('./utils/serviceWorkerUtils');
jest.mock('./utils/permissionUtils');
jest.mock('./utils/permissionHelper');

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

// Mock NotificationSettings component
jest.mock('./components/NotificationSettings', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="notification-settings-mock">Notification Settings (Mock)</div>
  };
});

// Mock tokenStorage
jest.mock('./utils/tokenStorage', () => ({
  saveUserToken: () => Promise.resolve(true),
}));

// Mock firebase-config
jest.mock('./firebase-config', () => ({
  firebaseConfig: {
    apiKey: 'mock-api-key',
    authDomain: 'mock-auth-domain',
    projectId: 'mock-project-id',
    storageBucket: 'mock-storage-bucket',
    messagingSenderId: 'mock-sender-id',
    appId: 'mock-app-id',
    measurementId: 'mock-measurement-id'
  },
  messaging: null
}));

test('renders App component', async () => {
  let container;
  await act(async () => {
    const renderResult = render(<App />);
    container = renderResult.container;
  });
  expect(container).toBeInTheDocument();
});
