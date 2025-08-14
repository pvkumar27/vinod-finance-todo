import React from 'react';
import { supabase } from '../supabaseClient';

const Navbar = ({ session }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center h-16">
          {/* Bottom Tab Navigation */}
          <div className="flex space-x-8">
            <button className="flex flex-col items-center space-y-1 text-purple-600">
              <span className="text-xl">💬</span>
              <span className="text-xs font-medium">Chat</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400">
              <span className="text-xl">💳</span>
              <span className="text-xs font-medium">Cards</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400">
              <span className="text-xl">📊</span>
              <span className="text-xs font-medium">Insights</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center space-y-1 text-gray-400"
            >
              <span className="text-xl">👤</span>
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
