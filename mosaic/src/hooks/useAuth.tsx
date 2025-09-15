import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { account } from '../lib/appwrite';
import type { Models } from 'appwrite';
import { OAuthProvider, ID } from 'appwrite';

// Types for our auth context
interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app starts
  useEffect(() => {
    checkUser();
  }, []);

  // Handle OAuth redirects
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        // OAuth was successful, get the user
        try {
          const currentUser = await account.get();
          setUser(currentUser);
          // Clean up URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error after OAuth success:', error);
        }
      } else if (urlParams.get('error')) {
        // OAuth failed
        console.error('OAuth error:', urlParams.get('error'));
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthRedirect();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      // User is not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Create session using the latest API
      await account.createEmailPasswordSession({
        email,
        password
      });
      
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error: any) {
      // Enhanced error handling for better UX
      if (error.code === 401) {
        throw new Error('Invalid email or password');
      } else if (error.code === 429) {
        throw new Error('Too many login attempts. Please try again later');
      } else if (error.message?.includes('Invalid email')) {
        throw new Error('Please enter a valid email address');
      } else {
        throw new Error(error.message || 'Login failed. Please try again');
      }
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // Create account with auto-generated ID using ID.unique()
      await account.create({
        userId: ID.unique(),
        email,
        password,
        name
      });
      
      // Auto-login after registration
      await account.createEmailPasswordSession({
        email,
        password
      });
      
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error: any) {
      // Enhanced error handling for registration
      if (error.code === 409) {
        throw new Error('An account with this email already exists');
      } else if (error.message?.includes('Password must be')) {
        throw new Error('Password must be at least 8 characters long');
      } else if (error.message?.includes('Invalid email')) {
        throw new Error('Please enter a valid email address');
      } else if (error.message?.includes('name')) {
        throw new Error('Please enter a valid name');
      } else {
        throw new Error(error.message || 'Registration failed. Please try again');
      }
    }
  };

    const loginWithGoogle = async () => {
    try {
      // OAuth2 login with Google using the latest API
      await account.createOAuth2Session({
        provider: OAuthProvider.Google,
        success: `${window.location.origin}/dashboard`,
        failure: `${window.location.origin}/login`
      });
    } catch (error: any) {
      // Enhanced error handling for OAuth
      if (error.code === 429) {
        throw new Error('Too many OAuth attempts. Please try again later');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your connection');
      } else {
        throw new Error(error.message || 'Google login failed. Please try again');
      }
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      // Clear remember me preference
      localStorage.removeItem('mosaic:rememberMe');
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      setUser(null);
      localStorage.removeItem('mosaic:rememberMe');
      throw new Error('Logout failed. Please try again');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}