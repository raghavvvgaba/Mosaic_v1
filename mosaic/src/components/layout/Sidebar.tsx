import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Folder, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Plus,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-border flex flex-col z-30">
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold">M</span>
            </div>
            <span className="font-semibold text-lg">Mosaic</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Home */}
          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard') 
                ? 'bg-accent text-accent-foreground' 
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>

          {/* Search */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>

          {/* Folders Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-4 py-2">
              <h3 className="text-sm font-medium text-muted-foreground">Folders</h3>
              <button className="p-1 hover:bg-muted rounded transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              <Link
                to="/dashboard/all"
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard/all') 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Folder className="h-4 w-4" />
                <span className="text-sm">All Notes</span>
              </Link>
              
              <Link
                to="/dashboard/recent"
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard/recent') 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Folder className="h-4 w-4" />
                <span className="text-sm">Recent</span>
              </Link>
              
              <Link
                to="/dashboard/favorites"
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard/favorites') 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Folder className="h-4 w-4" />
                <span className="text-sm">Favorites</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-border">
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="h-8 w-8 bg-accent rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProfileDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileDropdown(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      toggleTheme();
                      setShowProfileDropdown(false);
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-muted transition-colors rounded-t-lg"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    <span className="text-sm">Toggle Theme</span>
                  </button>
                  
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-muted transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-muted transition-colors text-red-500 rounded-b-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-background/70 backdrop-blur-sm animate-fade-in" 
            onClick={() => setShowSearchModal(false)}
          />
          <div className="relative w-full max-w-2xl bg-surface border border-border rounded-xl shadow-xl p-6 z-50 animate-scale-in mt-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Search Notes</h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes, content, tags..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/40"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            </div>
            
            <div className="mt-4 text-sm text-muted">
              <p>💡 Type to search through your notes</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
