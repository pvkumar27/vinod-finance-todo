import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';

const AuthForm = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/icons/official-logo.png" 
              alt="FinTask Logo" 
              className="h-16 w-auto" 
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            FinTask
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Your personal finance companion
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your cards, expenses, and tasks
          </p>
        </div>
        
        {/* Auth Form */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl rounded-2xl border border-gray-100">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              style: {
                button: {
                  background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                },
                input: {
                  borderRadius: '0.75rem',
                  border: '2px solid #e5e7eb',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                },
                label: {
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                },
                message: {
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                }
              }
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />
        </div>
        
        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;