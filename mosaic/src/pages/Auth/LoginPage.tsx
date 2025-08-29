import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard'); // We'll create this later
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-accent" />
            <h1 className="heading-3">Mosaic</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/signup" className="btn-secondary">
              Sign Up
            </Link>
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

      {/* Login Form */}
      <main className="container py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="heading-1 mb-2">Welcome Back</h1>
            <p className="body-base text-muted">
              Sign in to continue building your second brain
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block body-small mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block body-small mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="text-accent text-sm bg-accent/10 border border-accent/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-accent py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="body-small text-muted">
                Don't have an account?{' '}
                <Link to="/signup" className="text-accent hover:underline">
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
