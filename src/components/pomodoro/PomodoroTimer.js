import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PomodoroTimer = ({ selectedTask, onComplete, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [tickingEnabled, setTickingEnabled] = useState(true);
  const intervalRef = useRef(null);
  const tickIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const wakeLockRef = useRef(null);

  const modes = useMemo(
    () => ({
      work: { duration: 25 * 60, label: 'Focus Time', color: 'bg-red-500', emoji: '🍅' },
      shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'bg-green-500', emoji: '☕' },
      longBreak: { duration: 15 * 60, label: 'Long Break', color: 'bg-blue-500', emoji: '🌟' },
    }),
    []
  );

  const switchMode = useCallback(
    newMode => {
      setMode(newMode);
      setTimeLeft(modes[newMode].duration);
      setIsRunning(false);
    },
    [modes]
  );

  const playTickSound = useCallback(() => {
    if (!tickingEnabled) return;
    try {
      // Initialize audio context once and reuse
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Resume audio context if suspended (required for mobile)
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }

      // Skip if audio context is not running (mobile restriction)
      if (audioContext.state !== 'running') {
        return;
      }

      // Create white noise burst for authentic timer tick
      const bufferSize = audioContext.sampleRate * 0.02; // 20ms
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = buffer.getChannelData(0);

      // Generate white noise with quick decay
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (bufferSize * 0.1));
        output[i] = (Math.random() * 2 - 1) * decay * 0.8;
      }

      const whiteNoise = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gainNode = audioContext.createGain();

      whiteNoise.buffer = buffer;
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, audioContext.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

      whiteNoise.start(audioContext.currentTime);
    } catch (error) {
      console.log('Tick sound not supported:', error);
    }
  }, [tickingEnabled]);

  const handleTimerComplete = useCallback(() => {
    // Play notification sound
    playNotificationSound();

    if (mode === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);

      // Auto-switch to break
      if (newCount % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }

      // Notify parent if task is completed
      if (selectedTask && onComplete) {
        onComplete(selectedTask, newCount);
      }
    } else {
      // Break finished, switch back to work
      switchMode('work');
    }
  }, [mode, completedPomodoros, selectedTask, onComplete, switchMode]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      // Keep screen awake during Pomodoro
      if ('wakeLock' in navigator) {
        navigator.wakeLock
          .request('screen')
          .then(wakeLock => {
            wakeLockRef.current = wakeLock;
          })
          .catch(() => {});
      }
    } else {
      clearInterval(intervalRef.current);

      // Release wake lock when timer stops
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }

      if (timeLeft === 0) {
        handleTimerComplete();
      }
    }

    return () => {
      clearInterval(intervalRef.current);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [isRunning, timeLeft, handleTimerComplete]);

  // Separate interval for ticking sound to prevent pausing
  useEffect(() => {
    if (isRunning && tickingEnabled) {
      tickIntervalRef.current = setInterval(() => {
        playTickSound();
      }, 300);
    } else {
      clearInterval(tickIntervalRef.current);
    }

    return () => clearInterval(tickIntervalRef.current);
  }, [isRunning, tickingEnabled, playTickSound]);

  const playNotificationSound = () => {
    try {
      const audioContext =
        audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();

      // Play completion chime - 3 ascending tones
      const frequencies = [523, 659, 784]; // C5, E5, G5 - major chord

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';

        const startTime = audioContext.currentTime + index * 0.15;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
      });
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentMode = modes[mode];
  const progress = ((currentMode.duration - timeLeft) / currentMode.duration) * 100;

  return (
    <div className="bg-white rounded-2xl p-6 text-center shadow-2xl border max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <span className="mr-2">{currentMode.emoji}</span>
          {currentMode.label}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl">
          ✕
        </button>
      </div>

      {/* Selected Task */}
      {selectedTask && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Working on:</p>
          <p className="font-medium text-gray-800">{selectedTask.task}</p>
        </div>
      )}

      {/* Timer Display */}
      <div className="relative mb-6">
        <div className="w-48 h-48 mx-auto relative">
          {/* Progress Ring */}
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={`${currentMode.color.replace('bg-', 'text-')} transition-all duration-1000`}
              strokeLinecap="round"
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">{formatTime(timeLeft)}</div>
              <div className="text-sm text-gray-500">Pomodoro #{completedPomodoros + 1}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-2 mb-4">
        <button
          onClick={() => {
            // Initialize audio context on user interaction (required for mobile)
            if (!audioContextRef.current && tickingEnabled) {
              audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
              if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume().catch(() => {});
              }
            }
            setIsRunning(!isRunning);
          }}
          className={`px-4 py-3 rounded-lg text-white font-medium transition-colors ${currentMode.color} hover:opacity-90`}
        >
          {isRunning ? '⏸️ Pause' : '▶️ Start'}
        </button>

        {mode === 'work' && selectedTask && (
          <button
            onClick={() => {
              const focusedMinutes = Math.floor((currentMode.duration - timeLeft) / 60);
              const shouldComplete = window.confirm(
                `Task finished early? You've focused for ${focusedMinutes} minutes. Complete the task?`
              );
              if (shouldComplete && onComplete) {
                onComplete(selectedTask, completedPomodoros + 1, true); // true = early completion
                onCancel(); // Close the timer
              }
            }}
            className="px-4 py-3 rounded-lg text-white font-medium bg-green-500 hover:bg-green-600 transition-colors"
            disabled={timeLeft === currentMode.duration}
          >
            ✅ Done Early
          </button>
        )}

        {(mode === 'shortBreak' || mode === 'longBreak') && (
          <button
            onClick={() => switchMode('work')}
            className="px-4 py-3 rounded-lg text-white font-medium bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            ⏭️ Skip Break
          </button>
        )}

        <button
          onClick={() => {
            setTimeLeft(currentMode.duration);
            setIsRunning(false);
          }}
          className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          🔄 Reset
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center space-x-2">
        {Object.entries(modes).map(([key, modeData]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              mode === key
                ? `${modeData.color} text-white`
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {modeData.emoji} {modeData.label}
          </button>
        ))}
      </div>

      {/* Settings */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              // Initialize audio context on user interaction for mobile
              if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                if (audioContextRef.current.state === 'suspended') {
                  audioContextRef.current.resume().catch(() => {});
                }
              }
              setTickingEnabled(!tickingEnabled);
            }}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              tickingEnabled
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            <span className="mr-2">{tickingEnabled ? '🔊' : '🔇'}</span>
            {tickingEnabled ? 'Mute' : 'Unmute'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 text-sm text-gray-600">
        <div>Completed today: {completedPomodoros} 🍅</div>
        {mode === 'work' && timeLeft < currentMode.duration && (
          <div className="mt-1 text-xs text-blue-600">
            Focus time: {Math.floor((currentMode.duration - timeLeft) / 60)}m{' '}
            {(currentMode.duration - timeLeft) % 60}s
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
