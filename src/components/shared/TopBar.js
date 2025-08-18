import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { APP_VERSION } from '../../constants/version';

const TopBar = () => {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Close profile menu when clicking outside
    const handleClickOutside = () => setShowProfileMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getFirstLetter = email => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const getUserId = email => {
    return email ? email.split('@')[0] : 'user';
  };

  return (
    <div className="bg-gradient-to-r from-[#FDF3EE] via-white to-[#FCE7E2] border-b border-[#632D1F]/10 p-4 flex items-center justify-between shadow-sm backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#632D1F] to-[#8B4513] rounded-xl flex items-center justify-center shadow-lg">
          <img src="/icons/official-logo.png" alt="FinTask Logo" className="w-6 h-6 rounded-lg" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#632D1F] to-[#8B4513] bg-clip-text text-transparent">
            FinTask
          </h1>
          <p className="text-xs text-[#8B4513]/70 font-medium">
            {APP_VERSION.replace(/-build.*$/, '')} • AI Finance Assistant
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {user && (
          <div className="flex items-center space-x-2 relative">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#632D1F]">{greeting}</p>
              <p className="text-xs text-[#8B4513]/70">{getUserId(user.email)}</p>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                setShowProfileMenu(!showProfileMenu);
              }}
              className="w-9 h-9 bg-gradient-to-br from-[#632D1F] to-[#8B4513] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-white hover:scale-105 transition-all duration-200"
            >
              {getFirstLetter(user.email)}
            </button>

            {/* Profile Menu */}
            {showProfileMenu && (
              <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{getUserId(user.email)}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowProfileMenu(false);
                    alert('Profile settings coming soon!');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile Settings
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowProfileMenu(false);
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
