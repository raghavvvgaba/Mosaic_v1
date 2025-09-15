import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { notesService } from '../../lib/notesService';
import type { Note } from '../../types';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Load user notes on component mount
  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  // No modal now; full-screen editor page is used.

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

  // Creation handled in full-screen editor; no inline create here.

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    
    try {
      await notesService.deleteNote(noteId);
      await loadNotes(); // Refresh the notes list
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
    }
  };

  // Get unique tags from all notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])));

  const toggleTagFilter = (tag: string) => {
    setActiveTagFilters(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setActiveTagFilters([]);
    setSearch('');
  };

  // Filter and search notes
  const visibleNotes = notes.filter(note => {
    const matchesSearch = search === '' || 
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      stripHtml(note.content).toLowerCase().includes(search.toLowerCase());
    
    const matchesTags = activeTagFilters.length === 0 || 
      activeTagFilters.some(tag => note.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  if (!user) {
    return <div>Please log in to access your notes.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="heading-1 mb-2">Your Second Brain</h1>
            <p className="text-muted">Capture, connect, and cultivate your ideas</p>
          </div>
          <button
            onClick={() => navigate('/notes/new')}
            className="btn-accent flex items-center gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="md:hidden btn-secondary"
            >
              Filters {activeTagFilters.length > 0 && `(${activeTagFilters.length})`}
            </button>
          </div>
          
          {/* Tag Filters */}
          {(showFiltersMobile || window.innerWidth >= 768) && allTags.length > 0 && (
            <div className="bg-surface/60 rounded-lg p-4 border border-border/60">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Filter by tags:</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => {
                  const active = activeTagFilters.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTagFilter(tag)}
                      className={`px-2 py-1 rounded-full text-xs border transition-all ${active ? 'bg-accent text-accent-foreground border-accent shadow-sm' : 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/15'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-accent/10 border border-accent text-accent p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Notes List */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-surface/40 p-5 animate-pulse space-y-4">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-muted/70 rounded" />
                  <div className="h-3 bg-muted/60 rounded w-5/6" />
                  <div className="h-3 bg-muted/50 rounded w-2/3" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-3 w-16 bg-muted/60 rounded" />
                  <div className="flex gap-1">
                    <div className="h-4 w-10 bg-muted/40 rounded" />
                    <div className="h-4 w-8 bg-muted/30 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : visibleNotes.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <h3 className="heading-3 mb-2">No matches</h3>
            <p className="text-muted mb-4 text-sm">Try adjusting your search or filters.</p>
            {(activeTagFilters.length || search) && (
              <button onClick={clearFilters} className="btn-secondary text-xs">Reset Filters</button>
            )}
            <button
              onClick={() => navigate('/notes/new')}
              className="btn-accent"
            >
              Create a new note
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleNotes.map((note) => (
              <div
                key={note.$id}
                className="group rounded-lg border border-border/60 bg-surface/40 hover:bg-surface/60 p-5 transition-all hover:shadow-md hover:border-border cursor-pointer"
                onClick={() => navigate(`/notes/${note.$id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                    {note.title}
                  </h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.$id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all"
                    aria-label="Delete note"
                  >
                    ×
                  </button>
                </div>
                <p className="text-muted text-sm line-clamp-3 mb-4 leading-relaxed">
                  {stripHtml(note.content)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.$createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(note.tags || []).slice(0, 2).map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full border border-accent/20">
                        {tag}
                      </span>
                    ))}
                    {(note.tags || []).length > 2 && (
                      <span className="text-xs text-muted-foreground">+{(note.tags || []).length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No modal editor anymore; creation handled on /notes/new */}

        {/* Floating New Note Button (mobile) */}
        <button
          onClick={() => navigate('/notes/new')}
          className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center text-xl font-bold hover:shadow-xl active:scale-95 transition"
          aria-label="Create note"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
