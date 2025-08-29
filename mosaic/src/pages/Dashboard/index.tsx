import { useState, useEffect } from 'react';
import { Brain, Sun, Moon, LogOut, Plus, Search, Edit, Trash } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { notesService, type Note, type CreateNoteData } from '../../lib/notesService';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNote, setNewNote] = useState<CreateNoteData>({
    title: '',
    content: '',
    tags: []
  });

  // Load user notes on component mount
  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userNotes = await notesService.getUserNotes(user.$id);
      setNotes(userNotes);
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newNote.title.trim() || !newNote.content.trim()) return;

    try {
      const createdNote = await notesService.createNote(user.$id, newNote);
      setNotes([createdNote, ...notes]);
      setNewNote({ title: '', content: '', tags: [] });
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create note');
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesService.deleteNote(noteId);
      setNotes(notes.filter(note => note.$id !== noteId));
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

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
            <span className="body-small text-muted">
              Welcome, {user?.name}
            </span>
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
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="heading-1 mb-2">Welcome to your Second Brain</h1>
            <p className="body-large text-muted">
              Start capturing your thoughts and building connections.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="heading-3 mb-2">Quick Note</h3>
              <p className="body-base text-muted mb-4">
                Capture a thought quickly
              </p>
              <button className="btn-accent">Create Note</button>
            </div>

            <div className="card">
              <h3 className="heading-3 mb-2">Browse Notes</h3>
              <p className="body-base text-muted mb-4">
                View all your saved ideas
              </p>
              <button className="btn-secondary">View Notes</button>
            </div>

            <div className="card">
              <h3 className="heading-3 mb-2">Mind Map</h3>
              <p className="body-base text-muted mb-4">
                Visualize connections
              </p>
              <button className="btn-secondary">Open Canvas</button>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-12 card">
            <h3 className="heading-3 mb-4">Account Information</h3>
            <div className="space-y-2">
              <p className="body-base">
                <strong>Name:</strong> {user?.name}
              </p>
              <p className="body-base">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="body-base">
                <strong>User ID:</strong> {user?.$id}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
