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
    <div className="min-h-screen fin-gradient-bg flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl">
              <img
                src="/icons/official-logo.png"
                alt="FinTask Logo"
                className="w-20 h-20 rounded-3xl"
              />
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#632D1F] mb-4">FinTask</h2>
          <p className="text-lg text-gray-300 mb-2">Your AI-powered finance companion</p>
          <p className="text-sm text-gray-400">Sign in to unlock intelligent financial insights</p>
        </div>

        {/* Auth Form */}
        <div className="fin-card p-8">
          {authState.error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center space-x-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">{authState.error}</span>
            </div>
          )}

          {authState.success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-400 p-4 rounded-xl mb-6 flex items-center space-x-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">{authState.success}</span>
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
                  background: '#632D1F',
                  border: 'none',
                  borderRadius: '1rem',
                  padding: '0.875rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 45, 31, 0.3)',
                  color: 'white',
                },
                input: {
                  borderRadius: '1rem',
                  border: '1px solid rgba(99, 45, 31, 0.3)',
                  padding: '0.875rem 1rem',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  backgroundColor: 'white',
                  color: '#632D1F',
                },
                label: {
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#632D1F',
                  marginBottom: '0.5rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                },
                message: {
                  borderRadius: '1rem',
                  padding: '0.875rem',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  '&.supabase-auth-ui-message-error': {
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#fca5a5',
                  },
                  '&.supabase-auth-ui-message-success': {
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.5)',
                    color: '#6ee7b7',
                  },
                },
                container: {
                  gap: '1rem',
                },
                anchor: {
                  color: '#a78bfa',
                  fontWeight: '500',
                  textDecoration: 'none',
                  fontFamily: 'Inter, system-ui, sans-serif',
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">Secure authentication powered by Supabase</p>
          <div className="flex justify-center items-center space-x-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full finbot-animate-pulse"></div>
            <span className="text-xs text-gray-400">AI Assistant Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
