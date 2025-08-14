import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Navbar = ({ session }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const userEmail = session?.user?.email;
  const displayName = userEmail ? userEmail.split('@')[0] : 'User';

  return (
    <nav className="cleo-nav sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">F</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold cleo-text-gradient">FinTask</h1>
              <p className="text-xs text-gray-400 -mt-1">AI Finance Assistant</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Welcome back!</p>
                <p className="text-xs text-gray-400 capitalize">{displayName}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="cleo-button-secondary hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="sm:hidden py-4 border-t border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">{displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium text-white">Welcome back!</p>
                <p className="text-sm text-gray-400 capitalize">{displayName}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full cleo-button-secondary hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
