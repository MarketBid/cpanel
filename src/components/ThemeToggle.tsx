import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const tooltipText = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 touch-manipulation active:scale-95 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] ${className}`}
      aria-label={tooltipText}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 sm:h-6 sm:w-6" />
      ) : (
        <Moon className="h-5 w-5 sm:h-6 sm:w-6" />
      )}
    </button>
  );
};

export default ThemeToggle;

