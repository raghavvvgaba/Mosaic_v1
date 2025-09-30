import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import './App.css';

function App() {
  const { loading, user } = useAuth();
  const location = useLocation();
  const isEditorRoute = location.pathname === '/dashboard/new' || 
                       (location.pathname.startsWith('/dashboard/') && 
                        location.pathname !== '/dashboard' && 
                        location.pathname !== '/dashboard/' &&
                        !location.pathname.includes('/all') &&
                        !location.pathname.includes('/recent') &&
                        !location.pathname.includes('/favorites'));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated, use navbar layout
  if (!user) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col">
        {/* Navigation */}
        <Navbar />

        {/* Main content area - this is where route content will render */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Footer - only show on landing page for non-authenticated users */}
        <Footer />
      </div>
    );
  }

  // If user is authenticated, use sidebar layout
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area with offset for sidebar */}
      <div className="ml-64 min-h-screen">
        {/* Top search bar - hidden on full-screen editor routes */}
        {!isEditorRoute && (
          <div className="sticky top-0 z-20 bg-surface/80 backdrop-blur-sm border-b border-border p-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes, content, tags..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Main content area - this is where route content will render */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
