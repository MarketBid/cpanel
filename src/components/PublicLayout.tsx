import React from 'react';
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

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClassName}`}>
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl mx-auto">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-md dark:bg-[var(--bg-primary)]/90 shadow-lg px-6 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[var(--text-primary)] font-bold text-lg hover:opacity-80">
            <span className="h-9 w-9 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-text)] flex items-center justify-center font-extrabold tracking-tight">C</span>
            <span className="hidden sm:inline">Clarsix</span>
          </Link>

          <nav className="flex items-center gap-8 sm:gap-12 text-sm font-semibold text-[var(--text-secondary)]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`hover:text-[var(--text-primary)] transition-colors ${
                  location.pathname === item.href ? 'text-[var(--text-primary)] underline underline-offset-8 decoration-[var(--color-primary)]/70' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3">
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

            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Toggle navigation"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="md:hidden mt-2 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-lg">
            <div className="px-6 py-4 space-y-4">
              <div className="flex flex-col gap-3 text-sm font-semibold text-[var(--text-primary)]">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={`py-1 ${location.pathname === item.href ? 'text-[var(--color-primary)]' : 'text-[var(--text-primary)]'}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    navigate(isAuthenticated ? '/dashboard' : '/login');
                  }}
                >
                  {isAuthenticated ? 'Dashboard' : 'Log in'}
                </Button>
                <Button
                  variant="primary"
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
        )}
      </header>

      <main className="flex-1 pt-28">{children}</main>
    </div>
  );
};

export default PublicLayout;
