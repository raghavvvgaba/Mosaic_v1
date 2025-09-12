import { useEditor, EditorContent } from '@tiptap/react';
import * as TiptapReactNS from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import BubbleMenuExt from '@tiptap/extension-bubble-menu';
import FloatingMenuExt from '@tiptap/extension-floating-menu';
import { Extension, type Editor } from '@tiptap/core';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  Quote, 
  Highlighter,
  Minus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Compact IconButton for toolbar/bubble actions
const IconButton = ({
  icon,
  label,
  isActive = false,
  onClick,
  disabled = false
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={isActive}
    title={label}
    className={`p-2.5 rounded-md transition-all duration-150
      ${isActive 
        ? 'bg-accent text-accent-foreground shadow-sm' 
        : 'hover:bg-muted text-muted-foreground hover:text-foreground'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
      focus:outline-none focus:ring-2 focus:ring-accent/40`}
  >
    <div className="text-[16px] leading-none">{icon}</div>
  </button>
);

// Removed old bulky ToolbarButton/ToolbarGroup in favor of compact IconButton

// Use dynamic property access to avoid bundler warnings if names aren't statically exported
const bubbleKey = 'BubbleMenu' as const;
const floatingKey = 'FloatingMenu' as const;
const BubbleMenuC: any = (TiptapReactNS as any)[bubbleKey] ?? (() => null);
const FloatingMenuC: any = (TiptapReactNS as any)[floatingKey] ?? (() => null);

// Custom extension to handle backspace behavior in lists and Enter key behavior
const CustomKeymap = Extension.create({
  name: 'customKeymap',
  
  addKeyboardShortcuts() {
    return {
      // Tab should indent list items, or insert spaces in code blocks, otherwise fall back
      'Tab': ({ editor }) => {
        if (editor.isActive('listItem')) {
          return editor.chain().focus().sinkListItem('listItem').run();
        }
        if (editor.isActive('codeBlock')) {
          return editor.commands.insertContent('\t');
        }
        return false; // allow browser default
      },
      // Shift+Tab should outdent list items
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('listItem')) {
          return editor.chain().focus().liftListItem('listItem').run();
        }
        return false;
      },
      // Keep Shift+Enter as hard break
      'Shift-Enter': ({ editor }) => {
        return editor.commands.setHardBreak();
      },
      'Backspace': ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        
        // Check if we're in a list item and the item is empty
        if ($from.depth > 1) {
          const listItemNode = $from.node($from.depth - 1);
          const listNode = $from.node($from.depth - 2);
          
          // Check if we're in a list and the current item is empty
          if ((listNode.type.name === 'bulletList' || listNode.type.name === 'orderedList' || listNode.type.name === 'taskList') &&
              listItemNode.type.name === 'listItem' &&
              listItemNode.textContent === '' &&
              $from.parentOffset === 0) {
            
            // Exit the list and convert to paragraph
            editor.chain().focus().liftListItem('listItem').run();
            if (editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')) {
              editor.chain().focus().setParagraph().run();
            }
            return true;
          }
        }
        
        // Let the default backspace behavior handle other cases
        return false;
      }
    };
  }
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onTitleChange?: (title: string) => void;
  placeholder?: string;
  className?: string;
  unified?: boolean; // New prop to enable unified title/content mode
}

export default function RichTextEditor({
  content,
  onChange,
  onTitleChange,
  placeholder = "Start writing...",
  className = "",
  unified = false
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);
  const [editorState, setEditorState] = useState(0); // Track editor state changes for re-renders
  const [lastAlignment, setLastAlignment] = useState<'left' | 'center' | 'right'>('left');
  // editorState is intentionally unused - it's only used to trigger re-renders
  void editorState;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use our custom code block
        paragraph: {
          HTMLAttributes: {
            class: 'editor-paragraph',
          },
        },
        hardBreak: {
          HTMLAttributes: {
            class: 'editor-break',
          },
          keepMarks: false,
        },
        bulletList: {
          HTMLAttributes: {
            class: 'bullet-list',
          },
          keepMarks: false,
          keepAttributes: false,
        },
        orderedList: {
          HTMLAttributes: {
            class: 'ordered-list',
          },
          keepMarks: false,
          keepAttributes: false,
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item',
          },
        },
      }),
      CustomKeymap, // Add our custom keymap for backspace behavior
      // Menus as extensions (TipTap v3)
      BubbleMenuExt,
      FloatingMenuExt,
      Placeholder.configure({
        placeholder: unified ? (({ node }) => {
          if (node.type.name === 'heading') {
            return 'Untitled';
          }
          return 'Start writing...';
        }) : placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
        includeChildren: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-accent hover:text-accent/80 underline cursor-pointer transition-colors',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'px-1 rounded',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-8 border-border opacity-50',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Extract title from first heading if in unified mode
      if (unified && onTitleChange) {
        const firstNode = editor.getJSON().content?.[0];
        if (firstNode?.type === 'heading' && firstNode.content?.[0]?.type === 'text') {
          onTitleChange((firstNode.content[0] as any).text || '');
        } else {
          onTitleChange('');
        }
      }
      
      // Track alignment changes for persistence when content is deleted
      const currentAlign = getCurrentTextAlign();
      if (currentAlign !== lastAlignment) {
        setLastAlignment(currentAlign);
      }
      
      // If editor becomes empty and alignment was lost, restore it
      if (editor.isEmpty) {
        const emptyAlign = getCurrentTextAlign();
        if (emptyAlign === 'left' && lastAlignment !== 'left') {
          // Restore the last non-left alignment
          setTimeout(() => {
            if (lastAlignment === 'center') {
              editor.chain().focus().setTextAlign('center').run();
            } else if (lastAlignment === 'right') {
              editor.chain().focus().setTextAlign('right').run();
            }
          }, 0);
        }
      }
      
      // Ensure toolbar active states refresh on content edits
      setEditorState(prev => prev + 1);
    },
    onSelectionUpdate: () => {
      setEditorState(prev => prev + 1); // Refresh toolbar/bubble on selection changes
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] px-6 py-4 text-left ${unified ? 'unified-editor' : ''} ${className}`,
      },
      handleKeyDown: (_view, event) => {
        const isMod = (event as KeyboardEvent).metaKey || (event as KeyboardEvent).ctrlKey;
        if (isMod && (event as KeyboardEvent).key.toLowerCase() === 'k') {
          setShowLinkDialog(true);
          return true;
        }
        return false;
      },
    },
  });

  // removed legacy addLink (modal-based) in favor of inline bubble menu

  // Force re-render on selection changes and transactions (like delete)
  useEffect(() => {
    if (editor) {
      const updateState = () => setEditorState(prev => prev + 1);
      
      editor.on('selectionUpdate', updateState);
      editor.on('transaction', updateState);
      
      return () => {
        editor.off('selectionUpdate', updateState);
        editor.off('transaction', updateState);
      };
    }
  }, [editor]);

  // Initialize alignment tracking and set default for truly new docs
  useEffect(() => {
    if (!editor) return;
    
    // Initialize lastAlignment with current state
    const currentAlign = getCurrentTextAlign();
    setLastAlignment(currentAlign);
    
    // For completely new/empty docs, ensure left alignment is set
    if (editor.isEmpty && currentAlign === 'left' && !editor.getAttributes('paragraph')?.textAlign) {
      editor.chain().focus().setTextAlign('left').run();
    }
    
    // In unified mode, start with a heading if empty
    if (unified && editor.isEmpty) {
      editor.chain().focus().setHeading({ level: 1 }).run();
    }
  }, [editor, unified]);

  if (!editor) {
    return null;
  }

  // Removed unused MenuButton and DropdownButton

  // Helper function to get current highlight color
  const getCurrentHighlightColor = () => {
    if (editor && editor.isActive('highlight')) {
      const { color } = editor.getAttributes('highlight');
      return color || '#fef08a'; // Default to yellow if no specific color
    }
    return null;
  };

  // Removed getCurrentFormat since we no longer use dropdown

  // Helper to compute current text alignment, defaulting to 'left' when attribute is absent
  const getCurrentTextAlign = (): 'left' | 'center' | 'right' => {
    if (!editor) return lastAlignment;
    // Try heading first, then paragraph, then default
    const headingAttrs = editor.getAttributes('heading');
    const paragraphAttrs = editor.getAttributes('paragraph');
    const align = (headingAttrs?.textAlign ?? paragraphAttrs?.textAlign) as 'left' | 'center' | 'right' | undefined;
    // If no alignment attribute is found but we have a lastAlignment that's not left, use it
    if (!align && lastAlignment !== 'left') {
      return lastAlignment;
    }
    return align ?? 'left';
  };

  return (
    <div className={`rich-text-editor ${className || ''} flex flex-col h-full ${unified ? 'unified-mode' : ''}`}>
      {/* Compact Toolbar */}
      <div className="border-b border-border bg-muted/30 px-4 py-2 shrink-0">
        <div className="flex items-center flex-wrap gap-1">
          {/* Text Styles */}
          <IconButton icon={<Type size={16} />} label="Text" isActive={editor.isActive('paragraph') && !editor.isActive('bulletList') && !editor.isActive('orderedList') && !editor.isActive('taskList')} onClick={() => editor.chain().focus().setParagraph().run()} />
          <IconButton icon={<Heading1 size={16} />} label="Heading 1" isActive={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
          <IconButton icon={<Heading2 size={16} />} label="Heading 2" isActive={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
          <IconButton icon={<Heading3 size={16} />} label="Heading 3" isActive={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
          <IconButton icon={<Quote size={16} />} label="Quote" isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Inline formatting */}
          <IconButton icon={<Bold size={16} />} label="Bold" isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
          <IconButton icon={<Italic size={16} />} label="Italic" isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
          <IconButton icon={<UnderlineIcon size={16} />} label="Underline" isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
          <IconButton icon={<Strikethrough size={16} />} label="Strike" isActive={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
          <IconButton icon={<Code size={16} />} label="Inline code" isActive={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <IconButton icon={<List size={16} />} label="Bullet list" isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <IconButton icon={<ListOrdered size={16} />} label="Numbered list" isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <IconButton icon={<CheckSquare size={16} />} label="Task list" isActive={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Alignment - Single cycling button */}
          <IconButton 
            icon={
              getCurrentTextAlign() === 'left' ? <AlignLeft size={16} /> :
              getCurrentTextAlign() === 'center' ? <AlignCenter size={16} /> :
              <AlignRight size={16} />
            }
            label={`Text align: ${getCurrentTextAlign()} (click to cycle)`}
            onClick={() => {
              const current = getCurrentTextAlign();
              let next: 'left' | 'center' | 'right';
              if (current === 'left') {
                next = 'center';
              } else if (current === 'center') {
                next = 'right';
              } else {
                next = 'left';
              }
              
              // Apply the alignment change
              if (next === 'left') {
                // For left alignment, unset the attribute entirely
                editor.chain().focus().unsetTextAlign().run();
              } else {
                editor.chain().focus().setTextAlign(next).run();
              }
              
              // Force a re-render to update the button icon immediately
              setTimeout(() => {
                setEditorState(prev => prev + 1);
              }, 10);
              
              // Update lastAlignment to ensure persistence works correctly
              setLastAlignment(next);
            }}
          />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Link */}
          <IconButton icon={<LinkIcon size={16} />} label="Add link" onClick={() => setShowLinkDialog(true)} />

          {/* Highlight dropdown trigger */}
          <div className="relative">
            <IconButton
              icon={<Highlighter size={16} />}
              label={editor.isActive('highlight') ? `Highlight: ${getCurrentHighlightColor()}` : 'Highlight'}
              isActive={editor.isActive('highlight')}
              onClick={() => setShowHighlightDropdown(!showHighlightDropdown)}
            />
            {editor.isActive('highlight') && (
              <div 
                className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-background shadow-sm"
                style={{ backgroundColor: getCurrentHighlightColor() || undefined }}
              />
            )}
            {showHighlightDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowHighlightDropdown(false)} />
                <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-20 min-w-[160px] p-3">
                  <div className="text-xs text-muted-foreground mb-3 font-medium">
                    {editor.isActive('highlight') ? 'Change Highlight Color' : 'Highlight Colors'}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { color: '#fbbf24', name: 'Yellow' },
                      { color: '#60a5fa', name: 'Blue' },
                      { color: '#34d399', name: 'Green' },
                      { color: '#f87171', name: 'Red' },
                      { color: '#a78bfa', name: 'Purple' },
                      { color: '#fb923c', name: 'Orange' }
                    ].map((highlightColor) => {
                      const isCurrentColor = getCurrentHighlightColor() === highlightColor.color;
                      return (
                        <button
                          key={highlightColor.color}
                          onClick={() => {
                            if (editor.isActive('highlight')) {
                              editor.chain().focus().unsetHighlight().toggleHighlight({ color: highlightColor.color }).run();
                            } else {
                              editor.chain().focus().toggleHighlight({ color: highlightColor.color }).run();
                            }
                            setShowHighlightDropdown(false);
                          }}
                          className={`w-8 h-8 rounded border-2 hover:scale-110 transition-all duration-200 shadow-sm relative ${
                            isCurrentColor 
                              ? 'border-accent ring-2 ring-accent/30' 
                              : 'border-border hover:border-accent'
                          }`}
                          style={{ backgroundColor: highlightColor.color }}
                          title={highlightColor.name}
                        >
                          {isCurrentColor && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <hr className="border-border mb-2" />
                  <button
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run();
                      setShowHighlightDropdown(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded transition-colors"
                  >
                    Remove Highlight
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* History */}
          <IconButton icon={<Undo2 size={16} />} label="Undo" onClick={() => editor.chain().focus().undo().run()} />
          <IconButton icon={<Redo2 size={16} />} label="Redo" onClick={() => editor.chain().focus().redo().run()} />
        </div>
      </div>

      {/* Bubble Menu for quick selection formatting */}
      <BubbleMenuC editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-sm p-1">
        <IconButton icon={<Bold size={14} />} label="Bold" isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <IconButton icon={<Italic size={14} />} label="Italic" isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <IconButton icon={<UnderlineIcon size={14} />} label="Underline" isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <IconButton icon={<LinkIcon size={14} />} label="Add link" onClick={() => setShowLinkDialog(true)} />
        <IconButton icon={<Highlighter size={14} />} label="Highlight" isActive={editor.isActive('highlight')} onClick={() => setShowHighlightDropdown(true)} />
      </BubbleMenuC>

      {/* Link editor BubbleMenu (inline popover) */}
      {(showLinkDialog || editor.isActive('link')) && (
        <BubbleMenuC
          editor={editor}
          tippyOptions={{
            duration: 100,
            maxWidth: 350,
          }}
          shouldShow={(args: { editor: Editor }) => Boolean(showLinkDialog || args.editor.isActive('link'))}
          className="bg-background border border-border rounded-lg shadow-md p-2 flex items-center gap-2"
        >
          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl || (editor.getAttributes('link')?.href ?? '')}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if ((linkUrl || '').trim()) {
                  editor.chain().focus().extendMarkRange('link').setLink({ href: (linkUrl || '').trim() }).run();
                  setShowLinkDialog(false);
                  setLinkUrl('');
                }
              }
              if (e.key === 'Escape') {
                setShowLinkDialog(false);
              }
            }}
            className="w-[220px] px-3 py-2 text-sm border border-border rounded-md bg-background"
            autoFocus
          />
          <button
            className="px-2.5 py-1.5 text-xs rounded-md bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => {
              if ((linkUrl || '').trim()) {
                editor.chain().focus().extendMarkRange('link').setLink({ href: (linkUrl || '').trim() }).run();
                setShowLinkDialog(false);
                setLinkUrl('');
              }
            }}
          >
            Apply
          </button>
          {editor.isActive('link') && (
            <button
              className="px-2.5 py-1.5 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                setShowLinkDialog(false);
                setLinkUrl('');
              }}
            >
              Unlink
            </button>
          )}
        </BubbleMenuC>
      )}

      {/* Floating Menu for quick block insert at paragraph start */}
      <FloatingMenuC editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-sm p-1">
        <IconButton icon={<Heading1 size={14} />} label="H1" isActive={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <IconButton icon={<Heading2 size={14} />} label="H2" isActive={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <IconButton icon={<Heading3 size={14} />} label="H3" isActive={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <IconButton icon={<List size={14} />} label="Bullet list" isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <IconButton icon={<ListOrdered size={14} />} label="Numbered list" isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <IconButton icon={<CheckSquare size={14} />} label="Task list" isActive={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />
        <IconButton icon={<Quote size={14} />} label="Quote" isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <IconButton icon={<Minus size={14} />} label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      </FloatingMenuC>

      {/* Link Modal removed: replaced by inline BubbleMenu above */}

      {/* Main Content Area */}
      <div className="relative flex-1 overflow-auto">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none px-6 py-4 focus:outline-none h-full focus-within:ring-0"
        />
        {unified && (
          <style dangerouslySetInnerHTML={{
            __html: `
              .unified-editor .ProseMirror h1:first-child {
                font-size: 2.5rem !important;
                font-weight: 700 !important;
                line-height: 1.2 !important;
                margin-bottom: 1rem !important;
                color: var(--foreground) !important;
                border: none !important;
                padding: 0 !important;
              }
              .unified-editor .ProseMirror h1:first-child::before {
                content: '' !important;
              }
              .unified-editor .ProseMirror > *:first-child {
                margin-top: 0 !important;
              }
            `
          }} />
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-border px-4 py-2 bg-muted/20 text-xs text-muted-foreground shrink-0">
        <div className="flex items-center justify-between">
          <span>
            💡 <strong>Tip:</strong> Use markdown shortcuts like # for headings, - for lists, ``` for code blocks
          </span>
          <span className="text-xs">
            {editor.getJSON().content?.length || 0} blocks
          </span>
        </div>
      </div>
    </div>
  );
}
