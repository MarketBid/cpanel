import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Package,
  Plus,
  LayoutGrid,
  CreditCard,
  Users,
  Settings,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Command,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'actions' | 'transactions';
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  transactions?: any[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  transactions = [],
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const isKeyboardNavigationRef = useRef(false);
  const keyboardTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mouseHoveredIndexRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'View your dashboard',
      icon: <LayoutGrid className="h-4 w-4" />,
      action: () => { navigate('/dashboard'); onClose(); },
      category: 'navigation',
      keywords: ['home', 'overview'],
    },
    {
      id: 'nav-transactions',
      label: 'Transactions',
      description: 'View all transactions',
      icon: <Package className="h-4 w-4" />,
      action: () => { navigate('/transactions'); onClose(); },
      category: 'navigation',
      keywords: ['orders', 'payments'],
    },
    {
      id: 'nav-accounts',
      label: 'Payments',
      description: 'Manage payment accounts',
      icon: <CreditCard className="h-4 w-4" />,
      action: () => { navigate('/accounts'); onClose(); },
      category: 'navigation',
      keywords: ['billing', 'cards'],
    },
    {
      id: 'nav-users',
      label: 'Users',
      description: 'Manage users',
      icon: <Users className="h-4 w-4" />,
      action: () => { navigate('/users'); onClose(); },
      category: 'navigation',
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      description: 'Account settings',
      icon: <Settings className="h-4 w-4" />,
      action: () => { navigate('/settings'); onClose(); },
      category: 'navigation',
      keywords: ['profile', 'preferences'],
    },
    // Actions
    {
      id: 'action-new-transaction',
      label: 'Create New Transaction',
      description: 'Start a new transaction',
      icon: <Plus className="h-4 w-4" />,
      action: () => { navigate('/transactions/create'); onClose(); },
      category: 'actions',
      keywords: ['add', 'create', 'new'],
    },
    {
      id: 'action-join-transaction',
      label: 'Join Transaction',
      description: 'Join an existing transaction',
      icon: <Users className="h-4 w-4" />,
      action: () => { navigate('/transactions/join'); onClose(); },
      category: 'actions',
      keywords: ['participate', 'enter'],
    },
  ];

  // Add recent transactions to commands
  const transactionCommands: CommandItem[] = transactions.slice(0, 5).map(t => ({
    id: `transaction-${t.id}`,
    label: t.title || `Transaction ${t.transaction_id}`,
    description: `₵${t.amount} • ${t.status}`,
    icon: <Package className="h-4 w-4" />,
    action: () => { navigate(`/transactions/${t.transaction_id}`); onClose(); },
    category: 'transactions',
    keywords: [t.transaction_id, t.title, t.status],
  }));

  const allCommands = [...commands, ...transactionCommands];

  const filteredCommands = search
    ? allCommands.filter(cmd => {
        const searchLower = search.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(searchLower) ||
          cmd.description?.toLowerCase().includes(searchLower) ||
          cmd.keywords?.some(k => k.toLowerCase().includes(searchLower))
        );
      })
    : allCommands;

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      isKeyboardNavigationRef.current = false;
      mouseHoveredIndexRef.current = null;
      if (keyboardTimeoutRef.current) {
        clearTimeout(keyboardTimeoutRef.current);
        keyboardTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
    // Clear refs when search changes
    itemRefs.current.clear();
    isKeyboardNavigationRef.current = false;
    mouseHoveredIndexRef.current = null;
    if (keyboardTimeoutRef.current) {
      clearTimeout(keyboardTimeoutRef.current);
      keyboardTimeoutRef.current = null;
    }
  }, [search]);

  // Scroll selected item into view when navigating with arrow keys
  useEffect(() => {
    // Only auto-scroll if we're using keyboard navigation
    if (!isKeyboardNavigationRef.current) return;
    if (selectedIndex < 0 || selectedIndex >= filteredCommands.length) return;
    
    // Clear any pending scroll operations
    const rafId = requestAnimationFrame(() => {
      // Double-check flag is still true after RAF
      if (!isKeyboardNavigationRef.current) return;
      
      const selectedElement = itemRefs.current.get(selectedIndex);
      if (!selectedElement || !scrollContainerRef.current) return;
      
      // Use scrollIntoView with nearest block and auto behavior for immediate scroll
      selectedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'auto',
        inline: 'nearest'
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [selectedIndex, filteredCommands.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        // Clear any existing timeout
        if (keyboardTimeoutRef.current) {
          clearTimeout(keyboardTimeoutRef.current);
        }
        
        // Set keyboard navigation flag and clear mouse hover
        isKeyboardNavigationRef.current = true;
        mouseHoveredIndexRef.current = null; // Clear mouse hover when keyboard is used
        
        // Update selected index using functional update
        setSelectedIndex(prev => {
          const newIndex = e.key === 'ArrowDown' 
            ? Math.min(prev + 1, filteredCommands.length - 1)
            : Math.max(prev - 1, 0);
          return newIndex;
        });
        
        // Reset flag after user stops pressing arrow keys for a moment
        // Longer timeout to prevent mouse hover from interfering immediately
        keyboardTimeoutRef.current = setTimeout(() => {
          isKeyboardNavigationRef.current = false;
          keyboardTimeoutRef.current = null;
        }, 600);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (keyboardTimeoutRef.current) {
        clearTimeout(keyboardTimeoutRef.current);
      }
    };
  }, [isOpen, selectedIndex, filteredCommands]);

  if (!isOpen) return null;

  const categoryLabels = {
    navigation: 'Navigation',
    actions: 'Actions',
    transactions: 'Recent Transactions',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/50 backdrop-blur-sm m-0 p-0"
        />

        {/* Command palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-default)]">
            <Search className="h-5 w-5 text-[var(--text-tertiary)] flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for transactions, pages, or actions..."
              className="flex-1 bg-transparent border-0 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
            />
            <div className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-tertiary)] rounded text-xs text-[var(--text-secondary)]">
              <span>ESC</span>
            </div>
          </div>

          {/* Results */}
          <div ref={scrollContainerRef} className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="p-3 rounded-full bg-[var(--bg-tertiary)] mb-3">
                  <Search className="h-6 w-6 text-[var(--text-tertiary)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">No results found</p>
              </div>
            ) : (
              <div className="py-2">
                {Object.entries(groupedCommands).map(([category, items], categoryIndex) => (
                  <div key={category} className={categoryIndex > 0 ? 'mt-4' : ''}>
                    <div className="px-4 py-2">
                      <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                        {categoryLabels[category as keyof typeof categoryLabels]}
                      </h3>
                    </div>
                    {items.map((cmd, itemIndex) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <button
                          key={cmd.id}
                          ref={(el) => {
                            if (el) {
                              itemRefs.current.set(globalIndex, el);
                            } else {
                              itemRefs.current.delete(globalIndex);
                            }
                          }}
                          onClick={cmd.action}
                          onMouseEnter={() => {
                            // Ignore mouse hover if keyboard navigation is currently active
                            if (isKeyboardNavigationRef.current) {
                              return;
                            }
                            // Clear any previous mouse hover and set new one
                            mouseHoveredIndexRef.current = globalIndex;
                            setSelectedIndex(globalIndex);
                          }}
                          onMouseLeave={() => {
                            // Clear mouse hover index when mouse leaves
                            if (mouseHoveredIndexRef.current === globalIndex) {
                              mouseHoveredIndexRef.current = null;
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out ${
                            // Show primary highlight only for selected item when using keyboard
                            isSelected && isKeyboardNavigationRef.current
                              ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                              // Show primary highlight for selected item when using mouse
                              : isSelected && !isKeyboardNavigationRef.current
                              ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                              // Show hover background only when mouse is hovering and keyboard is not active
                              : mouseHoveredIndexRef.current === globalIndex && !isKeyboardNavigationRef.current
                              ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                              // Default state - no background
                              : 'bg-transparent text-[var(--text-primary)]'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-all duration-200 ease-in-out ${
                            // Show primary icon background for selected item
                            isSelected
                              ? 'bg-[var(--color-primary)] text-white'
                              // Default icon background
                              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                          }`}>
                            {cmd.icon}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-medium text-sm truncate">{cmd.label}</div>
                            {cmd.description && (
                              <div className="text-xs text-[var(--text-secondary)] truncate">
                                {cmd.description}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <ArrowRight className="h-4 w-4 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-default)] bg-[var(--bg-tertiary)]/50 text-xs text-[var(--text-tertiary)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded">↓</kbd>
                <span className="ml-1">Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded">↵</kbd>
                <span className="ml-1">Select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded">ESC</kbd>
              <span className="ml-1">Close</span>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;

