import { useState, useCallback, useEffect } from 'react';

const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const playSound = useCallback(
    (frequency, duration = 200, volume = 0.1) => {
      if (!soundEnabled) return;

      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + duration / 1000
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      } catch (error) {
        console.log('Audio not supported');
      }
    },
    [soundEnabled]
  );

  const success = useCallback(() => {
    // Soft chime - pleasant pop
    playSound(659.25, 150, 0.08);
    setTimeout(() => playSound(783.99, 200, 0.06), 75);
  }, [playSound]);

  const error = useCallback(() => {
    // Gentle low thump
    playSound(220, 300, 0.1);
  }, [playSound]);

  const taskComplete = useCallback(() => {
    // Pleasant pop
    playSound(523.25, 100, 0.08);
    setTimeout(() => playSound(659.25, 150, 0.06), 50);
  }, [playSound]);

  const buttonPress = useCallback(() => {
    // Subtle tap
    playSound(800, 80, 0.05);
  }, [playSound]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    success,
    error,
    taskComplete,
    buttonPress,
  };
};

export default useSoundEffects;
