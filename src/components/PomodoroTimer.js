import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import useAudioCues from '../hooks/useAudioCues';

const PomodoroTimer = ({ task, onComplete, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const { pomodoroEnd } = useAudioCues();

  useEffect(() => {
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      pomodoroEnd();
      if (!isBreak) {
        // Work session completed
        setIsBreak(true);
        setTimeLeft(5 * 60); // 5 minute break
      } else {
        // Break completed
        setIsBreak(false);
        setTimeLeft(25 * 60); // Reset to work session
      }
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, pomodoroEnd]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', duration: 0.25, bounce: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>🍅 Pomodoro Timer</CardTitle>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-center mb-6">
            <div className="headline mb-2">{task?.task || 'Focus Session'}</div>
            <div className="body-text text-secondary">{isBreak ? 'Break Time' : 'Focus Time'}</div>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 relative" style={{ width: '120px', height: '120px' }}>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="var(--border-light)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke={isBreak ? 'var(--success)' : 'var(--primary)'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ fontSize: '1.5rem', fontWeight: '700' }}
              >
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            <Button
              variant={isRunning ? 'secondary' : 'primary'}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? '⏸️ Pause' : '▶️ Start'}
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
                setIsRunning(false);
              }}
            >
              🔄 Reset
            </Button>

            {!isBreak && (
              <Button
                variant="secondary"
                onClick={() => {
                  pomodoroEnd();
                  onComplete();
                }}
              >
                ✅ Done Early
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PomodoroTimer;
