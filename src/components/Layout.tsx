import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  CreditCard,
  Menu,
  LogOut,
  Users,
  Settings,
  X,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  Command,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import ScrollToTopButton from './ScrollToTopButton';
import ThemeToggle from './ThemeToggle';
import NotificationCenter, { Notification } from './NotificationCenter';
import CommandPalette from './CommandPalette';
import { useTransactions } from '../hooks/queries/useTransactions';

import Logo from './Logo';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Transaction Completed',
      message: 'Transaction #TX12345 has been successfully completed.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'New Transaction',
      message: 'You have received a new transaction request.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
    {
      id: '3',
      type: 'warning',
      title: 'Payment Pending',
      message: 'Transaction #TX12344 is awaiting payment confirmation.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
    },
  ]);
  const { user, logout } = useAuth();
  const { isVisible, toggleVisibility } = useSensitiveInfo();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: transactions = [] } = useTransactions({ enabled: showCommandPalette });

  // Lock body scroll when sidebar is open on mobile (Safari-compatible)
  React.useEffect(() => {
    if (sidebarOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [sidebarOpen]);

  // Close sidebar on route change (Safari compatibility)
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle sensitive info (⌘U / Ctrl+U)
      if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
        event.preventDefault();
        toggleVisibility();
      }
      // Command palette (⌘K / Ctrl+K)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowCommandPalette(true);
      }
      // Close command palette (Escape)
      if (event.key === 'Escape' && showCommandPalette) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleVisibility, showCommandPalette]);

  // Notification handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Transactions', href: '/transactions', icon: Package },
    { name: 'Join Transaction', href: '/transactions/join', icon: Users },
    { name: 'Payments', href: '/accounts', icon: CreditCard },
    { name: 'Users', href: '/users', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-14 sm:h-16 shrink-0 items-center justify-between px-4 sm:px-6 border-b border-[var(--border-default)] bg-[var(--bg-sidebar)]/80 backdrop-blur-sm dark:bg-[var(--bg-sidebar)]/90">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
          <Logo size={56} />
          <h1 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">Clarsix</h1>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-light)] rounded-lg transition-colors touch-manipulation"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col p-3 sm:p-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-6 sm:gap-y-7">
          <li>
            <ul role="list" className="space-y-0.5 sm:space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                let isActive = false;
                if (item.href === '/transactions') {
                  isActive = location.pathname === '/transactions' || (location.pathname.startsWith('/transactions/') && !location.pathname.startsWith('/transactions/join'));
                } else if (item.href === '/transactions/join') {
                  isActive = location.pathname === '/transactions/join' || location.pathname.startsWith('/transactions/join/');
                } else if (item.href === '/accounts' && location.pathname.startsWith('/payment/initiate-payment')) {
                  isActive = true;
                } else {
                  isActive = location.pathname.startsWith(item.href);
                }

                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-x-2 sm:gap-x-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-[13px] font-medium transition-all touch-manipulation active:scale-95 ${isActive
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-light)]'
                        }`}
                    >
                      <Icon className={`h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0 ${isActive ? 'text-[var(--color-primary-text)]' : 'text-[var(--text-tertiary)]'}`} />
                      {item.name}
                      {isActive && <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-auto" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>

          <li className="mt-auto">
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-x-2 sm:gap-x-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-[13px] font-medium transition-all touch-manipulation active:scale-95 mb-2 ${location.pathname === '/profile'
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-light)]'
                }`}
            >
              <Settings className={`h-4 w-4 sm:h-[18px] sm:w-[18px] shrink-0 ${location.pathname === '/profile' ? 'text-[var(--color-primary-text)]' : 'text-[var(--text-tertiary)]'}`} />
              Settings
            </Link>

            <div className="rounded-lg border border-[var(--border-default)] p-2.5 sm:p-3 bg-[var(--bg-card)]/90 backdrop-blur-sm">
              <div className="flex items-center gap-x-2 sm:gap-x-3 mb-2 sm:mb-3">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center">
                  <span className="text-[var(--text-inverse)] font-semibold text-xs sm:text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-[var(--text-primary)] text-[11px] sm:text-xs">{user?.name}</p>
                  <p className="truncate text-[10px] sm:text-[11px] text-[var(--text-secondary)]">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-[var(--color-primary-text)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-dark)] rounded-lg transition-all touch-manipulation active:scale-95"
              >
                <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Log Out
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'
          }`}
        style={{
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)'
        }}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-[var(--text-inverse)]/60 transition-opacity duration-300 ease-in-out ${sidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            WebkitBackdropFilter: 'blur(4px)',
            backdropFilter: 'blur(4px)',
            WebkitTransform: 'translate3d(0, 0, 0)',
            transform: 'translate3d(0, 0, 0)'
          }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar panel */}
        <div
          className={`fixed inset-y-0 left-0 w-64 max-w-[80vw] bg-[var(--bg-sidebar)]/95 backdrop-blur-md border-r border-[var(--border-default)] shadow-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          style={{
            WebkitTransform: sidebarOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)',
            transform: sidebarOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)',
            willChange: sidebarOpen ? 'transform' : 'auto',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            perspective: 1000,
            WebkitPerspective: 1000
          }}
        >
          <div
            className="flex flex-col h-full overflow-y-auto"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-56 xl:lg:w-64 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-[var(--bg-sidebar)]/95 backdrop-blur-md border-r border-[var(--border-default)] shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-56 xl:lg:pl-64 pt-14 sm:pt-16">
        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 lg:left-56 xl:lg:left-64 z-50 flex h-14 sm:h-16 shrink-0 items-center gap-x-3 sm:gap-x-4 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/90 backdrop-blur-md px-3 sm:px-4 lg:px-8 shadow-sm">
          <button
            type="button"
            className="p-2 text-[var(--text-primary)] lg:hidden hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-light)] rounded-lg transition-colors touch-manipulation"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="flex-1 flex items-center justify-center max-w-xl mx-auto">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="hidden md:flex items-center gap-2 w-full max-w-md px-3 py-2 text-sm text-[var(--text-tertiary)] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg hover:border-[var(--color-primary)] transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Search transactions...</span>
              <div className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-tertiary)] rounded text-xs">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-x-2 sm:gap-x-3">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="md:hidden p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-x-2 text-[10px] sm:text-xs text-[var(--text-secondary)]">
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDelete={handleDeleteNotification}
              onClearAll={handleClearAllNotifications}
            />
            <ThemeToggle />
            <div className="relative group">
              <button
                onClick={toggleVisibility}
                className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-light)] rounded-lg transition-colors touch-manipulation"
                aria-label={isVisible ? 'Hide sensitive information' : 'Show sensitive information'}
              >
                {isVisible ? (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                {isVisible ? 'Hide sensitive info (⌘U)' : 'Show sensitive info (⌘U)'}
                {/* Tooltip arrow */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-slate-900 dark:border-b-slate-700" />
              </div>
            </div>
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-secondary-light)] transition-colors">
              <span className="text-[var(--text-inverse)] font-semibold text-xs sm:text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <main className="py-4 sm:py-6 lg:py-8">
          <div className="px-3 sm:px-4 lg:px-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
        <ScrollToTopButton />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        transactions={transactions}
      />
    </div>
  );
};

export default Layout;
