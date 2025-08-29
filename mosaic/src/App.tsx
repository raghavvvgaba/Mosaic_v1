import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, login, register, logout } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header with theme toggle */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="heading-3">Mosaic</h1>
            <p className="body-small">Minimalist Second Brain</p>
          </div>
          
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
      </header>

      {/* Main content */}
      <main className="container py-8">
        {/* Authentication Status & Test */}
        <section className="section">
          <div className="space-y-6">
            <h2 className="heading-2">Authentication Test</h2>
            
            {user ? (
              // User is logged in
              <div className="card">
                <h3 className="heading-3 mb-4">Welcome back!</h3>
                <p className="body-base mb-4">
                  <strong>Name:</strong> {user.name}<br />
                  <strong>Email:</strong> {user.email}<br />
                  <strong>User ID:</strong> {user.$id}
                </p>
                <button 
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  Logout
                </button>
                {error && <p className="text-accent mt-2">{error}</p>}
              </div>
            ) : (
              // User is not logged in - show auth form
              <div className="card max-w-md">
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={authMode === 'login' ? 'btn-primary' : 'btn-secondary'}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className={authMode === 'register' ? 'btn-primary' : 'btn-secondary'}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'register' && (
                    <div>
                      <label className="block body-small mb-1">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block body-small mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block body-small mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      required
                      minLength={8}
                    />
                  </div>

                  <button type="submit" className="btn-accent w-full">
                    {authMode === 'login' ? 'Login' : 'Create Account'}
                  </button>
                  
                  {error && <p className="text-accent text-sm">{error}</p>}
                </form>
              </div>
            )}
          </div>
        </section>

        {/* Theme showcase */}
        <section className="section">
          <div className="space-y-8">
            <div>
              <h2 className="heading-2 mb-4">Warm Cream & Coral Theme</h2>
              <p className="body-large mb-8 max-w-2xl">
                A sophisticated color system inspired by modern design, featuring warm cream backgrounds with bold coral accents.
                {theme === 'dark' 
                  ? ' Dark mode: #1a1a19 primary, #fefefe secondary, #e0414f accent' 
                  : ' Light mode: #fefefe primary, #262625 secondary, #e0414f accent'
                }
              </p>
            </div>

            {/* Color showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="heading-3 mb-4">Primary Color</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary border border-border rounded-lg"></div>
                  <div>
                    <p className="body font-mono">{theme === 'dark' ? '#1a1a19' : '#f7f4ec'}</p>
                    <p className="body-small">Background & primary elements</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="heading-3 mb-4">Secondary Color</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-secondary border border-border rounded-lg"></div>
                  <div>
                    <p className="body font-mono">{theme === 'dark' ? '#f7f4ec' : '#262625'}</p>
                    <p className="body-small">Text & contrast elements</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="heading-3 mb-4">Accent Color</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: '#e0414f' }}></div>
                  <div>
                    <p className="body font-mono">#e0414f</p>
                    <p className="body-small">Coral accent for highlights</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Button showcase */}
            <div>
              <h3 className="heading-3 mb-4">Button Components</h3>
              <div className="flex flex-wrap gap-4">
                <button className="btn-primary">Primary</button>
                <button className="btn-secondary">Secondary</button>
                <button className="btn-accent">Accent</button>
                <button className="btn-ghost">Ghost</button>
                <button className="btn-outline">Outline</button>
              </div>
            </div>

            {/* Badge showcase */}
            <div>
              <h3 className="heading-3 mb-4">Badge Components</h3>
              <div className="flex flex-wrap gap-4">
                <span className="badge badge-primary">Primary</span>
                <span className="badge badge-secondary">Secondary</span>
                <span className="badge badge-accent">Accent</span>
              </div>
            </div>

            {/* Input showcase */}
            <div>
              <h3 className="heading-3 mb-4">Input Components</h3>
              <div className="max-w-md space-y-4">
                <input className="input" placeholder="Enter your text..." />
                <textarea className="input resize-none" rows={3} placeholder="Enter description..."></textarea>
              </div>
            </div>

            {/* Card showcase */}
            <div>
              <h3 className="heading-3 mb-4">Card Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h4 className="heading-3 mb-2">Standard Card</h4>
                  <p className="body">This is a standard card with padding and border.</p>
                </div>
                <div className="card-compact">
                  <h4 className="heading-3 mb-2">Compact Card</h4>
                  <p className="body">This is a compact card with less padding.</p>
                </div>
              </div>
            </div>

            {/* Typography showcase */}
            <div>
              <h3 className="heading-3 mb-4">Typography</h3>
              <div className="space-y-4">
                <h1 className="heading-1">Heading 1</h1>
                <h2 className="heading-2">Heading 2</h2>
                <h3 className="heading-3">Heading 3</h3>
                <p className="body-large">Large body text for important content</p>
                <p className="body">Regular body text for most content</p>
                <p className="body-small">Small body text for secondary information</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="container py-8">
          <p className="body-small text-center">
            Mosaic - Built with React, Vite, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
