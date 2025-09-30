import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import RichTextEditor from '../../components/editor/RichTextEditor';
import { useToast } from '../../components/ui/Toast';

export default function NoteEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { success } = useToast();

  // Frontend-only state for now. We'll wire backend later.
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  const handleSave = () => {
    // Frontend-only: just show a toast. We'll integrate create/update later.
    success(id ? 'Note updated' : 'Note saved', title ? `“${title}”` : 'Backend integration coming next');
  };

  return (
    <div className="min-h-[calc(100vh)] flex flex-col">
      {/* Top action bar */}
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            {id && (
              <span className="text-xs text-muted-foreground">Editing note • {id}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 text-sm inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <RichTextEditor
            content={content}
            onChange={setContent}
            onTitleChange={setTitle}
            placeholder="Start with a heading..."
            className="min-h-[calc(100vh-120px)]"
            unified={true}
          />
        </div>
      </div>
    </div>
  );
}
