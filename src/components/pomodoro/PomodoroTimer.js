import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PomodoroTimer = ({ selectedTask, onComplete, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef(null);

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
    } else {
      clearInterval(intervalRef.current);

      if (timeLeft === 0) {
        handleTimerComplete();
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, handleTimerComplete]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
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
    <div className="finbot-card p-6 text-center">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="finbot-heading-lg flex items-center">
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
          onClick={() => setIsRunning(!isRunning)}
          className={`finbot-button-primary px-4 py-3 ${currentMode.color}`}
        >
          {isRunning ? '⏸️ Pause' : '▶️ Start'}
        </button>

        {mode === 'work' && selectedTask && (
          <button
            onClick={() => {
              const shouldComplete = window.confirm(
                `Task finished early? You've focused for ${Math.floor((currentMode.duration - timeLeft) / 60)} minutes. Complete the task?`
              );
              if (shouldComplete && onComplete) {
                onComplete(selectedTask, completedPomodoros + 1, true); // true = early completion
              }
            }}
            className="finbot-button-primary px-4 py-3 bg-green-500 hover:bg-green-600"
            disabled={timeLeft === currentMode.duration}
          >
            ✅ Done Early
          </button>
        )}

        <button
          onClick={() => {
            setTimeLeft(currentMode.duration);
            setIsRunning(false);
          }}
          className="finbot-button-secondary px-4 py-3"
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
