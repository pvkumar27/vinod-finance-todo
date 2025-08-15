import React from 'react';

const RoastOrHypeButtons = ({ onRoast, onHype }) => {
  return (
    <div className="flex gap-3 mt-3 animate-slide-up-fade">
      <button
        onClick={onRoast}
        className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white font-medium text-sm shadow-md transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
      >
        Roast me ✨
      </button>
      <button
        onClick={onHype}
        className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 text-white font-medium text-sm shadow-md transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
      >
        Hype me ⭐
      </button>
    </div>
  );
};

export default RoastOrHypeButtons;
