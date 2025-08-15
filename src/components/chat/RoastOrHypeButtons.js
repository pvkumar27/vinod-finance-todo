import React from 'react';

const RoastOrHypeButtons = ({ onRoast, onHype }) => {
  return (
    <div className="flex gap-3 mt-3 animate-slide-up-fade">
      <button
        onClick={onRoast}
        className="px-5 py-3 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold text-sm shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
      >
        Roast me 🔥
      </button>
      <button
        onClick={onHype}
        className="px-5 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
      >
        Hype me ⚡
      </button>
    </div>
  );
};

export default RoastOrHypeButtons;
