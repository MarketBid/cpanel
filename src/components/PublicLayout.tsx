import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';

interface PublicLayoutProps {
  children: React.ReactNode;
  backgroundClassName?: string;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, backgroundClassName = 'bg-white' }) => {
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
      <header className="sticky top-0 z-40 border-b border-[#E6E8EA] bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#0A1F16] font-bold text-lg hover:opacity-80">
            <span className="h-9 w-9 rounded-xl bg-[#04805B] text-white flex items-center justify-center font-extrabold tracking-tight">C</span>
            Clarsix
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#4B5563]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`hover:text-[#0A1F16] transition-colors ${
                  location.pathname === item.href ? 'text-[#0A1F16] underline underline-offset-8 decoration-[#04805B]/70' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#0A1F16] hover:bg-[#F5F7F7]"
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

          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#F5F7F7] text-[#0A1F16]"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-[#E6E8EA] bg-white">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              <div className="flex flex-col gap-3 text-sm font-semibold text-[#0A1F16]">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={`py-1 ${location.pathname === item.href ? 'text-[#04805B]' : 'text-[#0A1F16]'}`}
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

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default PublicLayout;
