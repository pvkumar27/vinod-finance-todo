export const getSmartTheme = () => {
  const hour = new Date().getHours();
  const savedTheme = localStorage.getItem('finance_todos_theme');

  // Auto dark mode between 7 PM and 7 AM
  const shouldBeDark = hour >= 19 || hour < 7;

  if (savedTheme === 'auto' || !savedTheme) {
    return shouldBeDark ? 'dark' : 'light';
  }

  return savedTheme;
};

export const applyTheme = theme => {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  localStorage.setItem('finance_todos_theme', theme);
};

export const getAccessibilityPreferences = () => {
  return {
    highContrast: localStorage.getItem('finance_todos_high_contrast') === 'true',
    largeText: localStorage.getItem('finance_todos_large_text') === 'true',
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
};

export const applyAccessibilityPreferences = preferences => {
  const root = document.documentElement;

  if (preferences.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  if (preferences.largeText) {
    root.classList.add('large-text');
  } else {
    root.classList.remove('large-text');
  }

  localStorage.setItem('finance_todos_high_contrast', preferences.highContrast);
  localStorage.setItem('finance_todos_large_text', preferences.largeText);
};
