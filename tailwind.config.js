/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media', // Use media query for dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007AFF',
          50: '#E6F3FF',
          100: '#CCE7FF',
          500: '#007AFF',
          600: '#0051D5',
          700: '#003D99',
          light: '#5AC8FA',
          dark: '#0051D5',
        },
        secondary: {
          DEFAULT: '#34C759',
          50: '#E8F5E8',
          500: '#34C759',
          600: '#248A3D',
          light: '#30D158',
          dark: '#248A3D',
        },
        accent: {
          DEFAULT: '#FF9500',
          50: '#FFF4E6',
          500: '#FF9500',
          600: '#D2691E',
          light: '#FFCC02',
          dark: '#D2691E',
        },
        success: {
          DEFAULT: '#34C759',
          50: '#E8F5E8',
          500: '#34C759',
          600: '#248A3D',
        },
        warning: {
          DEFAULT: '#FFCC02',
          50: '#FFFBEB',
          500: '#FFCC02',
          600: '#D2691E',
        },
        danger: {
          DEFAULT: '#FF3B30',
          50: '#FFE6E6',
          500: '#FF3B30',
          600: '#D70015',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F9F9FB',
          tertiary: '#EFEFF4',
        },
        text: {
          primary: '#1C1C1E',
          secondary: '#3A3A3C',
          tertiary: '#8E8E93',
          quaternary: '#C7C7CC',
        },
        border: {
          DEFAULT: '#E5E5EA',
          secondary: '#D1D1D6',
        },
        background: {
          DEFAULT: '#F2F2F7',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.05)',
        floating: '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        card: '16px',
        button: '12px',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
