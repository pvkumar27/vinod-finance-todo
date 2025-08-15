import { useState } from 'react';

const useToneMode = () => {
  const [toneMode, setToneMode] = useState('normal'); // 'normal', 'roast', 'hype'
  const [roastIndex, setRoastIndex] = useState(0);
  const [hypeIndex, setHypeIndex] = useState(0);

  const roastReplies = [
    'Your budget ghosted your savings 👻',
    'Did you really need 4 coffee deliveries this week? ☕💸',
    'Your impulse buying has entered the chat 🛍️',
    'Savings account looking lonely lately 😭',
    'That subscription you forgot about says hi 👋💸',
    'Your budget called, it wants a relationship 📞💔',
  ];

  const hypeReplies = [
    "You're a savings machine 💰",
    'Budget goals = CRUSHED 💪',
    'Financial wizard in the building 🧙‍♂️✨',
    'Money moves looking FIRE 🔥💸',
    'Your future self is thanking you 🙏',
    'Wealth building mode: ACTIVATED 🚀💰',
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
