import { Link } from 'react-router-dom';
import { Sun, Moon, Brain, User, LogOut, Home } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between py-4">
        {/* Logo and branding */}
        <Link to="/" className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-accent" />
          <div>
            <h1 className="heading-3">Mosaic</h1>
            <p className="body-small">Minimalist Second Brain</p>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          {/* Navigation based on auth status */}
          {user ? (
            // Authenticated navigation
            <>
              <Link to="/dashboard" className="btn-ghost">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="body-small">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </>
          ) : (
            // Unauthenticated navigation
            <>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/signup" className="btn-accent">
                Get Started
              </Link>
            </>
          )}
          
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
