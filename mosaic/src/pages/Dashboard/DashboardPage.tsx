import { useState, useEffect } from 'react';
import { Brain, Sun, Moon, LogOut, Plus, Trash } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { notesService } from '../../lib/notesService';
import type { Note, CreateNoteData } from '../../types';

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
  const [tagInput, setTagInput] = useState('');

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
      setTagInput('');
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create note');
      console.error(err);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !(newNote.tags || []).includes(trimmedTag)) {
      setNewNote({ ...newNote, tags: [...(newNote.tags || []), trimmedTag] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote({
      ...newNote,
      tags: (newNote.tags || []).filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
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
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-accent" />
            <div>
              <h1 className="heading-3">Mosaic</h1>
              <p className="text-sm text-muted">Welcome back, {user?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
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

      {/* Main Content */}
      <main className="container py-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="heading-2">Your Notes</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-accent flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Note</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-accent/10 border border-accent text-accent p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Create Note Form */}
        {showCreateForm && (
          <div className="card mb-8">
            <h3 className="heading-3 mb-4">Create New Note</h3>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block body-small mb-1">Title</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Enter note title..."
                  required
                />
              </div>
              <div>
                <label className="block body-small mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground h-32 resize-y"
                  placeholder="Write your note content..."
                  required
                />
              </div>
              <div>
                <label className="block body-small mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(newNote.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-accent/10 text-accent rounded text-xs flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-accent/70"
                        aria-label={`Remove ${tag} tag`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="btn-accent">
                  Create Note
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted">Loading your notes...</div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="heading-3 mb-2">No notes yet</h3>
            <p className="text-muted mb-4">Create your first note to get started with your Second Brain!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-accent"
            >
              Create Your First Note
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div key={note.$id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="heading-3 line-clamp-2">{note.title}</h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleDeleteNote(note.$id)}
                      className="p-1 text-muted hover:text-accent transition-colors"
                      title="Delete note"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="body-base text-muted line-clamp-3 mb-4">{note.content}</p>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{new Date(note.$createdAt).toLocaleDateString()}</span>
                  {note.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {note.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
