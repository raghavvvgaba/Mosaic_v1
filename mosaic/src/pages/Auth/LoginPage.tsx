import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import GoogleButton from '../../components/ui/GoogleButton';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await toast.promise(
        login(email, password),
        {
          loading: ['Logging in...', 'Verifying your credentials'],
          success: ['Logged in', 'Welcome back to Mosaic!'],
          error: ['Login failed', 'Please check your email and password'],
        }
      );
      navigate('/dashboard');
    } catch (err) {
      // Error already shown via promise toast; keep catch to stop flow
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="heading-1 mb-2">Welcome Back</h1>
            <p className="body-base text-muted">
              Login to continue building your second brain
            </p>
          </div>

          <div className="card">
            {/* OAuth */}
            <GoogleButton
              onClick={() => {
                toast.promise(
                  loginWithGoogle(),
                  {
                    loading: ['Connecting to Google...', 'Redirecting to Google Login'],
                    success: ['Redirecting...', 'Google authentication started'],
                    error: ['Google Login failed', 'Please try again'],
                  }
                );
              }}
            />

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-border flex-1" />
              <span className="body-small text-muted">Or continue with email</span>
              <div className="h-px bg-border flex-1" />
            </div>

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



              {/* Errors are shown via toasts */}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-accent py-3 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                )}
                <span>{loading ? 'Logging in...' : 'Login'}</span>
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
    </div>
  );
}
