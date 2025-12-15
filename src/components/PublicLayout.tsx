import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';

interface PublicLayoutProps {
  children: React.ReactNode;
  backgroundClassName?: string;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, backgroundClassName = 'bg-[var(--bg-primary)]' }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Contact', href: '/contact' },
  ];

  // Close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClassName}`}>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Mobile: Full-width header */}
        <div className="md:hidden w-full border-b border-[var(--border-default)] bg-[var(--bg-primary)]/95 backdrop-blur-md shadow-sm">
          <div className="px-4 h-14 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-base hover:opacity-80 transition-opacity"
              onClick={() => setOpen(false)}
            >
              <span className="h-8 w-8 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-text)] flex items-center justify-center font-extrabold text-sm">C</span>
              <span>Clarsix</span>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-light)] text-[var(--text-primary)] transition-colors touch-manipulation"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Toggle navigation"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Centered header */}
        <div className="hidden md:block">
          <div className="top-6 w-[95%] max-w-6xl mx-auto relative">
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-md dark:bg-[var(--bg-primary)]/90 shadow-lg px-6 sm:px-8 h-16 flex items-center justify-between relative">
              <Link to="/" className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-lg hover:opacity-80 transition-opacity">
                <span className="h-9 w-9 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-text)] flex items-center justify-center font-extrabold tracking-tight">C</span>
                <span>Clarsix</span>
              </Link>

              <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 sm:gap-12 text-sm font-semibold text-[var(--text-secondary)]">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`hover:text-[var(--text-primary)] transition-colors ${location.pathname === item.href ? 'text-[var(--text-primary)] underline underline-offset-8 decoration-[var(--color-primary)]/70' : ''
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                >
                  {isAuthenticated ? 'Dashboard' : 'Log in'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => navigate(isAuthenticated ? '/transactions/create' : '/register')}
                >
                  {isAuthenticated ? 'New transaction' : 'Get started'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-[var(--text-inverse)]/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-in Menu */}
          <div className={`md:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[var(--bg-primary)] shadow-2xl z-50 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'
            }`}>
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
                <span className="text-lg font-bold text-[var(--text-primary)]">Menu</span>
                <button
                  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-light)] text-[var(--text-primary)] transition-colors"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-6 py-6 overflow-y-auto">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-base font-semibold transition-colors touch-manipulation ${location.pathname === item.href
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-light)]'
                        }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Action Buttons */}
              <div className="px-6 py-6 border-t border-[var(--border-default)] space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => {
                    setOpen(false);
                    navigate(isAuthenticated ? '/dashboard' : '/login');
                  }}
                >
                  {isAuthenticated ? 'Dashboard' : 'Log in'}
                </Button>
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => {
                    setOpen(false);
                    navigate(isAuthenticated ? '/transactions/create' : '/register');
                  }}
                >
                  {isAuthenticated ? 'New transaction' : 'Get started'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <main className="flex-1 md:pt-28 pt-14">{children}</main>
    </div>
  );
};

export default PublicLayout;
