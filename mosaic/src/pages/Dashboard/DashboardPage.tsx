import { useState, useEffect } from 'react';
import { Plus, Trash, Brain } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { notesService } from '../../lib/notesService';
import type { Note, CreateNoteData } from '../../types';
import RichTextEditor from '../../components/editor/RichTextEditor';

export default function DashboardPage() {
  const { user } = useAuth();
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
  const TITLE_LIMIT = 120;
  const [search, setSearch] = useState('');
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

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

  const addTag = (raw?: string) => {
    const source = typeof raw === 'string' ? raw : tagInput;
    const pieces = source.split(/[,]/).map(p => p.trim()).filter(Boolean);
    if (!pieces.length) return;
    const uniqueNew = pieces.filter(p => !(newNote.tags || []).includes(p));
    if (uniqueNew.length) {
      setNewNote({ ...newNote, tags: [...(newNote.tags || []), ...uniqueNew] });
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote({
      ...newNote,
      tags: (newNote.tags || []).filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter, Comma, Tab
    if (['Enter', 'Tab'].includes(e.key) || (e.key === ',')) {
      if (tagInput.trim()) {
        e.preventDefault();
        addTag();
      }
    } else if (e.key === 'Backspace' && !tagInput) {
      // Remove last tag when backspacing on empty input
      const current = newNote.tags || [];
      if (current.length) {
        e.preventDefault();
        removeTag(current[current.length - 1]);
      }
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



  // Derived data helpers
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags))).sort();

  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const toggleTagFilter = (tag: string) => {
    setActiveTagFilters(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const clearFilters = () => {
    setActiveTagFilters([]);
    setSearch('');
  };

  const visibleNotes = notes.filter(note => {
    if (activeTagFilters.length && !activeTagFilters.every(t => note.tags.includes(t))) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const text = (note.title + ' ' + stripHtml(note.content) + ' ' + note.tags.join(' ')).toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  // Close modal with Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCreateForm) setShowCreateForm(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showCreateForm]);

  return (
    <div className="container py-8">
        {/* Actions & Search */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="heading-2">Dashboard</h2>
              {notes.length > 0 && (
                <span className="px-2 py-1 text-xs rounded bg-accent/10 text-accent font-medium">{notes.length} notes</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:min-w-[260px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes, content, tags..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">⌘K</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-accent flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Note</span>
                </button>
                { (activeTagFilters.length || search) && (
                  <button onClick={clearFilters} className="btn-secondary text-xs px-3">Reset</button>
                )}
              </div>
            </div>
          </div>
          {/* Tag Filters (collapsible on mobile) */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                className="md:hidden px-3 py-1.5 rounded bg-muted text-xs text-muted-foreground hover:text-foreground"
              >
                {showFiltersMobile ? 'Hide Tags' : 'Show Tags'}
              </button>
              <div className={`flex flex-wrap gap-2 ${showFiltersMobile ? 'block' : 'hidden md:flex'}`}>
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

        {/* Create Note Form (Modal) */}
        {showCreateForm && (
          <div className="fixed inset-0 z-40 flex items-start justify-center p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowCreateForm(false)} />
            <div className="relative w-full max-w-5xl bg-surface border border-border rounded-xl shadow-xl p-6 md:p-8 z-50 animate-scale-in">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="heading-3 mb-1">Create New Note</h3>
                  <p className="text-sm text-muted">Capture a thought, idea, or resource. Use the rich editor for structure.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                  aria-label="Close create note form"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateNote} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <label className="block body-small mb-2">Title</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newNote.title}
                          onChange={(e) => setNewNote({ ...newNote, title: e.target.value.slice(0, TITLE_LIMIT) })}
                          className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/40 text-lg font-medium tracking-tight"
                          placeholder="e.g. Idea about spaced repetition system..."
                          required
                        />
                        <span className={`absolute bottom-1 right-2 text-[10px] ${newNote.title.length >= TITLE_LIMIT ? 'text-accent' : 'text-muted'} font-medium`}>{newNote.title.length}/{TITLE_LIMIT}</span>
                      </div>
                    </div>
                    <div>
                      <label className="body-small mb-2 flex items-center justify-between">
                        <span>Content</span>
                        <span className="text-xs text-muted">Use / for quick actions (coming soon)</span>
                      </label>
                      <div className="rounded-lg border border-border focus-within:ring-2 focus-within:ring-accent/40 bg-background/60">
                        <RichTextEditor
                          content={newNote.content}
                          onChange={(content) => setNewNote({ ...newNote, content })}
                          placeholder="Start writing your note..."
                          className="min-h-[180px]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block body-small mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(newNote.tags || []).map((tag, index) => (
                          <span
                            key={index}
                            className="group px-2 py-1 bg-accent/10 text-accent rounded-full text-xs flex items-center gap-1 pr-2 border border-accent/20 hover:bg-accent/15 transition"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="opacity-70 group-hover:opacity-100 hover:text-accent/80"
                              aria-label={`Remove ${tag} tag`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
                        placeholder="Type tag and press Enter, Tab, or Comma"
                      />
                      <p className="mt-1 text-[11px] text-muted">Organize with 1-3 short tags (e.g. research, idea, reference).</p>
                    </div>
                    <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted">
                      <p className="mb-1 font-medium text-foreground/80">Coming Soon</p>
                      <p>Attach files • Link references • AI summaries</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/60">
                  <div className="text-xs text-muted order-2 sm:order-1">
                    Press <span className="px-1 py-0.5 rounded bg-muted text-foreground/80">Esc</span> to cancel
                  </div>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-accent"
                      disabled={!newNote.title.trim() || !newNote.content.trim()}
                    >
                      Create Note
                    </button>
                  </div>
                </div>
              </form>
            </div>
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
        ) : notes.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
            <Brain className="h-16 w-16 text-muted mx-auto mb-6" />
            <h3 className="heading-3 mb-3">Start Building Your Second Brain</h3>
            <p className="text-muted mb-6 max-w-md mx-auto">Notes you capture appear here. Organize with tags, highlight insights, and connect ideas over time.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-accent"
            >
              Create Your First Note
            </button>
          </div>
        ) : visibleNotes.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <h3 className="heading-3 mb-2">No matches</h3>
            <p className="text-muted mb-4 text-sm">Try adjusting your search or filters.</p>
            {(activeTagFilters.length || search) && (
              <button onClick={clearFilters} className="btn-secondary text-xs">Reset Filters</button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visibleNotes.map((note) => {
              const preview = stripHtml(note.content).slice(0, 180) + (stripHtml(note.content).length > 180 ? '…' : '');
              return (
                <div
                  key={note.$id}
                  className="group relative rounded-xl border border-border bg-surface/80 hover:bg-surface shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4 overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold tracking-tight text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">{note.title}</h3>
                    <button
                      onClick={() => handleDeleteNote(note.$id)}
                      className="opacity-60 hover:opacity-100 hover:text-accent transition-colors p-1 rounded"
                      title="Delete note"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted leading-relaxed line-clamp-4">{preview || 'No content yet.'}</p>
                  <div className="mt-auto flex items-center justify-between text-[11px] text-muted pt-2 border-t border-border/60">
                    <span>{new Date(note.$createdAt).toLocaleDateString()}</span>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap justify-end max-w-[70%]">
                        {note.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-[10px]">+{note.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating New Note Button (mobile) */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center text-xl font-bold hover:shadow-xl active:scale-95 transition"
          aria-label="Create note"
        >
          <Plus className="h-6 w-6" />
        </button>
    </div>
  );
}
