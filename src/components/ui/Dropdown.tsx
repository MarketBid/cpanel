import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'filled';
  searchable?: boolean;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  searchable = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3',
  };

  const variantClasses = {
    default: 'bg-[var(--bg-card)] border border-[var(--border-default)]',
    bordered: 'bg-transparent border-2 border-[var(--border-medium)]',
    filled: 'bg-[var(--bg-tertiary)] border-0',
  };

  const filteredOptions = searchable
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 rounded-lg
          ${sizeClasses[size]} ${variantClasses[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--color-primary)] cursor-pointer'}
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${!selectedOption ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`flex-shrink-0 h-4 w-4 text-[var(--text-secondary)] transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-lg overflow-hidden"
          >
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-[var(--border-default)]">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-tertiary)] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50"
                />
              </div>
            )}

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[var(--text-tertiary)] text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      disabled={option.disabled}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 text-left
                        ${isSelected ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-[var(--text-primary)]'}
                        ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--bg-tertiary)] cursor-pointer'}
                        transition-colors duration-150
                      `}
                    >
                      {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                            {option.description}
                          </div>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;

