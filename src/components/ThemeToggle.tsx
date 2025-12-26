import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-5 right-5 z-50 p-3.5 rounded-2xl transition-all duration-500 hover:-translate-y-1 group overflow-hidden"
      style={{
        background: theme === 'light' 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,250,240,0.9) 100%)'
          : 'linear-gradient(135deg, rgba(45,37,32,0.95) 0%, rgba(60,48,38,0.9) 100%)',
        boxShadow: theme === 'light'
          ? '0 4px 20px -5px rgba(139, 69, 19, 0.15), 0 2px 8px -3px rgba(139, 69, 19, 0.1), inset 0 1px 0 rgba(255,255,255,0.5)'
          : '0 4px 20px -5px rgba(0, 0, 0, 0.4), 0 2px 8px -3px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        border: theme === 'light' 
          ? '1px solid rgba(210, 180, 140, 0.4)'
          : '1px solid rgba(100, 80, 60, 0.4)',
      }}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    >
      {/* Background glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: theme === 'light'
            ? 'radial-gradient(circle at center, rgba(245,158,11,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle at center, rgba(251,191,36,0.2) 0%, transparent 70%)'
        }}
      />
      
      {theme === 'light' ? (
        // Moon icon for switching to dark mode
        <svg
          className="relative w-5 h-5 text-espresso-700 group-hover:text-amber-700 transition-all duration-500 group-hover:rotate-[-20deg]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // Sun icon for switching to light mode
        <svg
          className="relative w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-all duration-500 group-hover:rotate-[20deg]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}
