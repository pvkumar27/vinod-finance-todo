import { useState, useCallback, useEffect, useRef } from 'react';

const useAudioCues = () => {
  const [audioEnabled, setAudioEnabled] = useState(() => {
    const saved = localStorage.getItem('audioEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const audioRefs = useRef({});

  useEffect(() => {
    localStorage.setItem('audioEnabled', JSON.stringify(audioEnabled));
  }, [audioEnabled]);

  // Preload audio files
  useEffect(() => {
    if (audioEnabled) {
      // Create audio elements with data URLs for small sounds
      audioRefs.current = {
        success: createAudioFromFrequency([523.25, 659.25, 783.99], [100, 100, 150]), // C-E-G chord
        error: createAudioFromFrequency([220], [300]), // Low buzz
        pomodoroEnd: createAudioFromFrequency(
          [523.25, 659.25, 783.99, 1046.5],
          [150, 150, 150, 200]
        ), // Pleasant chime
      };
    }
  }, [audioEnabled]);

  const createAudioFromFrequency = (frequencies, durations) => {
    if (!window.AudioContext && !window.webkitAudioContext) return null;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const totalDuration = durations.reduce((sum, dur) => sum + dur, 0) / 1000;
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, sampleRate * totalDuration, sampleRate);
      const data = buffer.getChannelData(0);

      let offset = 0;
      frequencies.forEach((freq, i) => {
        const duration = durations[i] / 1000;
        const samples = sampleRate * duration;

        for (let j = 0; j < samples; j++) {
          const t = j / sampleRate;
          const envelope = Math.exp(-t * 3); // Fade out
          data[offset + j] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.1;
        }
        offset += samples;
      });

      return { audioContext, buffer };
    } catch (error) {
      console.log('Audio creation failed:', error);
      return null;
    }
  };

  const playAudio = useCallback(
    type => {
      if (!audioEnabled || !audioRefs.current[type]) return;

      try {
        const { audioContext, buffer } = audioRefs.current[type];
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      } catch (error) {
        console.log('Audio playback failed:', error);
      }
    },
    [audioEnabled]
  );

  const taskComplete = useCallback(() => playAudio('success'), [playAudio]);
  const error = useCallback(() => playAudio('error'), [playAudio]);
  const pomodoroEnd = useCallback(() => playAudio('pomodoroEnd'), [playAudio]);

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
  }, []);

  return {
    audioEnabled,
    toggleAudio,
    taskComplete,
    error,
    pomodoroEnd,
  };
};

export default useAudioCues;
