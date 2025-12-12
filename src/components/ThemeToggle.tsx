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
    <div className="relative group">
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
      {/* Tooltip */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
        {tooltipText}
        {/* Tooltip arrow */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-slate-900 dark:border-b-slate-700" />
      </div>
    </div>
  );
};

export default ThemeToggle;

