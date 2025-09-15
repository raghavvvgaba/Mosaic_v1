import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import GoogleButton from '../../components/ui/GoogleButton';
import { useToast } from '../../components/ui/Toast';

export default function SignupPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    const length8 = pwd.length >= 8;
    const length12 = pwd.length >= 12;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

    let score = 0;
    if (length8) score += 1;
    if (length12) score += 1;
    if (hasLower && hasUpper) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;
    score = Math.min(4, score);

    const map = [
      { label: 'Very weak', barClass: 'bg-red-500', textClass: 'text-red-500' },
      { label: 'Weak', barClass: 'bg-orange-500', textClass: 'text-orange-500' },
      { label: 'Fair', barClass: 'bg-yellow-500', textClass: 'text-yellow-500' },
      { label: 'Good', barClass: 'bg-green-500', textClass: 'text-green-600' },
      { label: 'Strong', barClass: 'bg-green-600', textClass: 'text-green-600' },
    ];

    const info = map[score] ?? map[0];
    const percent = (score / 4) * 100;
    return { score, percent, ...info };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  // Errors are communicated via toast

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await toast.promise(
        register(email, password, name),
        {
          loading: ['Creating account...', 'Setting up your workspace'],
          success: ['Account created', 'Welcome to Mosaic!'],
          error: ['Registration failed', 'Please try again'],
        }
      );
      navigate('/dashboard'); // We'll create this later
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
            <h1 className="heading-1 mb-2">Create Your Account</h1>
            <p className="body-base text-muted">
              Start building your second brain today
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
                <label htmlFor="name" className="block body-small mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Your full name"
                  required
                />
              </div>

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
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                />
                {password && (
                  <div className="mt-2" aria-live="polite">
                    {(() => {
                      const s = getPasswordStrength(password);
                      return (
                        <>
                          <div
                            className="h-2 w-full rounded bg-secondary/20"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={4}
                            aria-valuenow={s.score}
                          >
                            <div
                              className={`h-2 rounded transition-all duration-300 ${s.barClass}`}
                              style={{ width: `${s.percent}%` }}
                            />
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="body-small text-muted">Password strength</span>
                            <span className={`body-small ${s.textClass}`}>{s.label}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block body-small mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
                {confirmPassword && (
                  <div className="mt-1 flex items-center justify-between" aria-live="polite">
                    <span className="body-small text-muted">Match status</span>
                    <span className={`body-small ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                      {password === confirmPassword ? 'Matches' : 'Doesn’t match'}
                    </span>
                  </div>
                )}
              </div>

              {/* Errors are shown via toasts */}

              <button
                type="submit"
                disabled={(() => {
                  if (loading) return true;
                  const match = password === confirmPassword;
                  const { score } = getPasswordStrength(password);
                  // Require at least 'Fair' (score >= 2) and matching passwords
                  return !(match && score >= 2);
                })()}
                className="w-full btn-accent py-3 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                )}
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="body-small text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-accent hover:underline">
                  Login here
                </Link>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}
