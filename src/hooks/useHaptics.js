import { useCallback } from 'react';

const useHaptics = () => {
  const triggerHaptic = useCallback((type = 'light') => {
    if (!navigator.vibrate) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 100, 50],
      tap: [5],
    };

    navigator.vibrate(patterns[type] || patterns.light);
  }, []);

  const lightTap = useCallback(() => triggerHaptic('tap'), [triggerHaptic]);
  const mediumTap = useCallback(() => triggerHaptic('medium'), [triggerHaptic]);
  const success = useCallback(() => triggerHaptic('success'), [triggerHaptic]);
  const error = useCallback(() => triggerHaptic('error'), [triggerHaptic]);

  return {
    lightTap,
    mediumTap,
    success,
    error,
    triggerHaptic,
  };
};

export default useHaptics;
