import { useCallback, useRef, useState, useEffect } from 'react';

const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const audioContextRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }

    return audioContextRef.current;
  }, []);

  const playSound = useCallback(
    (type, options = {}) => {
      if (!soundEnabled) return;

      try {
        const audioContext = initAudioContext();
        if (audioContext.state !== 'running') return;

        const { frequency = 800, duration = 0.2, volume = 0.1, waveType = 'sine' } = options;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (error) {
        console.log('Sound not supported:', error);
      }
    },
    [soundEnabled, initAudioContext]
  );

  // Predefined sound effects
  const sounds = {
    // Success sounds
    taskComplete: () => playSound('success', { frequency: 523, duration: 0.3, volume: 0.15 }),
    success: () => playSound('success', { frequency: 659, duration: 0.25, volume: 0.12 }),

    // Interaction sounds
    buttonPress: () => playSound('press', { frequency: 1000, duration: 0.1, volume: 0.08 }),
    cardFlip: () => playSound('flip', { frequency: 800, duration: 0.15, volume: 0.1 }),
    swipe: () => playSound('swipe', { frequency: 600, duration: 0.12, volume: 0.09 }),

    // Notification sounds
    notification: () => playSound('notification', { frequency: 880, duration: 0.2, volume: 0.1 }),
    alert: () => playSound('alert', { frequency: 440, duration: 0.3, volume: 0.12 }),

    // Error sounds
    error: () => playSound('error', { frequency: 300, duration: 0.4, volume: 0.1 }),

    // Navigation sounds
    pageTransition: () => playSound('transition', { frequency: 700, duration: 0.18, volume: 0.08 }),

    // Special effects
    celebration: () => {
      // Multi-tone celebration
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        setTimeout(() => {
          playSound('celebration', { frequency: freq, duration: 0.3, volume: 0.12 });
        }, index * 100);
      });
    },
  };

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playSound,
    ...sounds,
  };
};

export default useSoundEffects;
