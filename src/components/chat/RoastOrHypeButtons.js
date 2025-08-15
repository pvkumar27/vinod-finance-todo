import React from 'react';

const RoastOrHypeButtons = ({ onRoast, onHype }) => {
  return (
    <div className="flex gap-3 mt-4 space-y-2 animate-slide-up-fade">
      <button
        onClick={onRoast}
        className="px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm shadow-md transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 uppercase"
      >
        Roast me 🔥
      </button>
      <button
        onClick={onHype}
        className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-sm shadow-md transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 uppercase"
      >
        Hype me ⚡
      </button>
    </div>
  );
};

export default RoastOrHypeButtons;
