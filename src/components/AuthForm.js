import React, { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';
import '../styles/auth.css';

const AuthForm = () => {
  const [authState, setAuthState] = useState({
    loading: false,
    error: null,
    success: null,
  });

  // Custom auth state handler
  const handleAuthStateChange = (event, session) => {
    if (event === 'SIGNED_IN') {
      setAuthState({
        loading: false,
        error: null,
        success: 'Successfully signed in! Redirecting...',
      });
    } else if (event === 'SIGNED_OUT') {
      setAuthState({
        loading: false,
        error: null,
        success: 'Successfully signed out!',
      });
    } else if (event === 'PASSWORD_RECOVERY') {
      setAuthState({
        loading: false,
        error: null,
        success: 'Password reset email sent! Check your inbox.',
      });
    } else if (event === 'USER_UPDATED') {
      setAuthState({
        loading: false,
        error: null,
        success: 'User information updated successfully!',
      });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 auth-container relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="auth-logo">
              <img
                src="/icons/official-logo.png"
                alt="FinTask Logo"
                className="h-16 w-auto"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64"><path fill="%233B82F6" d="M19 5v2h-4V5h4M9 5v6H5V5h4m10 8v6h-4v-6h4M9 17v2H5v-2h4M21 3h-8v6h8V3zM11 3H3v10h8V3zm10 8h-8v10h8V11zm-10 4H3v6h8v-6z"/></svg>';
                }}
              />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 font-['Segoe UI',system-ui,sans-serif]">
            FinTask
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-['Segoe UI',system-ui,sans-serif]">
            Your personal finance companion
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your cards, expenses, and tasks
          </p>
        </div>

        {/* Auth Form */}
        <div className="gradient-border">
          <div className="card-fancy py-8 px-6 sm:px-8 rounded-xl auth-form-container">
            {authState.error && (
              <div className="auth-error">
                <span className="auth-error-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </span>
                {authState.error}
              </div>
            )}

            {authState.success && (
              <div className="auth-success">
                <span className="auth-success-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </span>
                {authState.success}
              </div>
            )}

            <Auth
              supabaseClient={supabase}
              onError={error => {
                setAuthState({
                  loading: false,
                  error: error.message,
                  success: null,
                });
              }}
              onAuthStateChange={handleAuthStateChange}
              appearance={{
                theme: ThemeSupa,
                style: {
                  button: {
                    background: 'linear-gradient(to right, #3b82f6, #4f46e5)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                    fontFamily: 'Segoe UI, system-ui, sans-serif',
                    cursor: 'pointer',
                    className: 'auth-button',
                  },
                  input: {
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    fontFamily: 'Segoe UI, system-ui, sans-serif',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  },
                  label: {
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    fontFamily: 'Segoe UI, system-ui, sans-serif',
                  },
                  message: {
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    fontFamily: 'Segoe UI, system-ui, sans-serif',
                    '&.supabase-auth-ui-message-error': {
                      backgroundColor: '#fee2e2',
                      borderLeft: '4px solid #ef4444',
                      color: '#b91c1c',
                    },
                    '&.supabase-auth-ui-message-success': {
                      backgroundColor: '#dcfce7',
                      borderLeft: '4px solid #22c55e',
                      color: '#15803d',
                    },
                  },
                  container: {
                    gap: '1rem',
                  },
                  anchor: {
                    color: '#3b82f6',
                    fontWeight: '500',
                    textDecoration: 'none',
                    fontFamily: 'Segoe UI, system-ui, sans-serif',
                  },
                  loader: {
                    className: 'auth-loading',
                  },
                },
                // Add validation icons
                classNames: {
                  input: 'auth-input-wrapper',
                  message: 'auth-message',
                  button: 'auth-button',
                },
              }}
              providers={[]}
              redirectTo={window.location.origin}
            />

            {authState.loading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-400">Secure authentication powered by Supabase</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
