import React from 'react';

const RoastOrHypeButtons = ({ onRoast, onHype }) => {
  return (
    <div className="flex gap-3 mt-4 animate-slide-up-fade">
      <button
        onClick={onRoast}
        className="px-4 py-2 rounded-full bg-[#5C2E27] text-white font-bold text-sm shadow-sm transform transition-all duration-200 hover:bg-[#4A241F] focus:outline-none focus:ring-2 focus:ring-[#D9B6A9] uppercase tracking-wide antialiased"
      >
        Roast Me<span className="inline-block text-[1.15em] align-middle ml-1">🔥</span>
      </button>
      <button
        onClick={onHype}
        className="px-4 py-2 rounded-full bg-[#5C2E27] text-white font-bold text-sm shadow-sm transform transition-all duration-200 hover:bg-[#4A241F] focus:outline-none focus:ring-2 focus:ring-[#D9B6A9] uppercase tracking-wide antialiased"
      >
        Hype Me<span className="inline-block text-[1.15em] align-middle ml-1">⚡</span>
      </button>
    </div>
  );
};

export default RoastOrHypeButtons;
