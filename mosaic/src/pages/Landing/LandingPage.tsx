import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Brain, Users, Zap } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-accent" />
            <h1 className="heading-3">Mosaic</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/signup" className="btn-accent">
              Get Started
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

      {/* Hero Section */}
      <main className="container py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Your Second Brain, <span className="text-accent">Simplified</span>
          </h1>
          <p className="text-xl text-muted mb-12 max-w-2xl mx-auto">
            Capture thoughts, connect ideas, and build your knowledge network. 
            Mosaic helps you organize your mind with beautiful visual connections.
          </p>
          
          <div className="flex justify-center space-x-4 mb-16">
            <Link to="/signup" className="btn-accent text-lg px-8 py-3">
              Start Building Your Brain
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3">
              Welcome Back
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="card text-center">
              <Brain className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="heading-3 mb-2">Smart Notes</h3>
              <p className="body-base text-muted">
                Capture ideas with rich text, links, and connections that grow with your thinking.
              </p>
            </div>
            
            <div className="card text-center">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="heading-3 mb-2">Visual Canvas</h3>
              <p className="body-base text-muted">
                See your knowledge network come alive with interactive mind maps and connections.
              </p>
            </div>
            
            <div className="card text-center">
              <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="heading-3 mb-2">Lightning Fast</h3>
              <p className="body-base text-muted">
                Built for speed with modern technology. Your thoughts, captured instantly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
