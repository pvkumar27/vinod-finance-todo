import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const TopBar = () => {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('');

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
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    window.location.reload();
  };

  const getFirstLetter = email => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const getUserId = email => {
    return email ? email.split('@')[0] : 'user';
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img src="/icons/official-logo.png" alt="FinTask Logo" className="w-8 h-8 rounded-lg" />
        <h1 className="text-xl font-bold text-[#632D1F]">FinTask</h1>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{greeting}</p>
              <p className="text-xs text-gray-500">{getUserId(user.email)}</p>
            </div>
            <div className="w-8 h-8 bg-[#632D1F] text-white rounded-full flex items-center justify-center font-bold text-sm">
              {getFirstLetter(user.email)}
            </div>
          </div>
        )}
        <button className="fin-button-primary text-xs px-4 py-2" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default TopBar;
