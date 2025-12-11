import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  debounce?: number;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Search...',
  loading = false,
  debounce = 300,
  size = 'md',
  fullWidth = false,
  autoFocus = false,
  className = '',
}) => {
  const [value, setValue] = useState(controlledValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-8 text-xs pl-8 pr-8',
    md: 'h-10 text-sm pl-10 pr-10',
    lg: 'h-12 text-base pl-12 pr-12',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const iconPositions = {
    sm: 'left-2.5',
    md: 'left-3',
    lg: 'left-4',
  };

  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);

    if (onSearch && debounce > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounce);
    } else if (onSearch) {
      onSearch(newValue);
    }
  };

  const handleClear = () => {
    setValue('');
    onChange?.('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : 'w-full max-w-md'} ${className}`}>
      {/* Search icon */}
      <div className={`absolute ${iconPositions[size]} top-1/2 -translate-y-1/2 pointer-events-none`}>
        {loading ? (
          <Loader2 className={`${iconSizes[size]} text-[var(--text-tertiary)] animate-spin`} />
        ) : (
          <Search className={`${iconSizes[size]} text-[var(--text-tertiary)]`} />
        )}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`
          w-full rounded-lg bg-[var(--bg-card)] border transition-all duration-200
          ${sizeClasses[size]}
          ${
            isFocused
              ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-opacity-20'
              : 'border-[var(--border-default)] hover:border-[var(--border-medium)]'
          }
          focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
        `}
      />

      {/* Clear button */}
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className={`absolute ${iconPositions[size]} right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors`}
            type="button"
          >
            <X className={`${iconSizes[size]} text-[var(--text-secondary)]`} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchInput;

