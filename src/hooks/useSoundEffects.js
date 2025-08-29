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
    (frequency, duration = 150, type = 'sine') => {
      if (!soundEnabled) return;

      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + duration / 1000
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      } catch (error) {
        console.log('Audio not supported:', error);
      }
    },
    [soundEnabled]
  );

  const taskComplete = useCallback(() => {
    // Soft success chime - C major chord
    playSound(523.25, 100); // C5
    setTimeout(() => playSound(659.25, 100), 50); // E5
    setTimeout(() => playSound(783.99, 150), 100); // G5
  }, [playSound]);

  const buttonPress = useCallback(() => {
    // Subtle tap sound
    playSound(800, 50);
  }, [playSound]);

  const success = useCallback(() => {
    // Single pleasant tone
    playSound(659.25, 200);
  }, [playSound]);

  const error = useCallback(() => {
    // Low warning tone
    playSound(220, 300);
  }, [playSound]);

  const pomodoroStart = useCallback(() => {
    // Ascending chime
    playSound(440, 100);
    setTimeout(() => playSound(554.37, 100), 100);
    setTimeout(() => playSound(659.25, 150), 200);
  }, [playSound]);

  const pomodoroEnd = useCallback(() => {
    // Descending completion chime
    playSound(783.99, 150);
    setTimeout(() => playSound(659.25, 150), 150);
    setTimeout(() => playSound(523.25, 200), 300);
  }, [playSound]);

  const notification = useCallback(() => {
    // Gentle notification sound
    playSound(523.25, 100);
    setTimeout(() => playSound(659.25, 150), 100);
  }, [playSound]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    taskComplete,
    buttonPress,
    success,
    error,
    pomodoroStart,
    pomodoroEnd,
    notification,
  };
};

export default useSoundEffects;
