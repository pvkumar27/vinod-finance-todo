import { useState } from 'react';

const useToneMode = () => {
  const [toneMode, setToneMode] = useState('normal'); // 'normal', 'roast', 'hype'
  const [roastIndex, setRoastIndex] = useState(0);
  const [hypeIndex, setHypeIndex] = useState(0);

  const roastReplies = [
    "You bought avocado toast again, didn't you? 🥑✨",
    'Your budget has abandonment issues 💎',
    'Savings? Never heard of her 🌙',
    'You treat budgets like suggestions 🌸',
    'Your money ghosted your savings account 💋',
    'That impulse buy was really necessary, right? 🎀👀',
  ];

  const hypeReplies = [
    "You're a financial genius in the making 🎆✨",
    "Your bank account's blushing from that smart move! 🌸💰",
    'One step closer to money mastery 🌟💎',
    "You're killing it 🎉",
    'Look at you, budget boss 👑',
    'Financial goals are shaking in their boots! 🎆✨',
  ];

  const getRoastReply = () => {
    const reply = roastReplies[roastIndex];
    setRoastIndex((roastIndex + 1) % roastReplies.length);
    setToneMode('roast');
    return reply;
  };

  const getHypeReply = () => {
    const reply = hypeReplies[hypeIndex];
    setHypeIndex((hypeIndex + 1) % hypeReplies.length);
    setToneMode('hype');
    return reply;
  };

  return {
    toneMode,
    setToneMode,
    getRoastReply,
    getHypeReply,
  };
};

export default useToneMode;
