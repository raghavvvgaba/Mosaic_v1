import { useEditor, EditorContent } from '@tiptap/react';
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
import { Extension } from '@tiptap/core';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  Quote, 
  ChevronDown, 
  Highlighter,
  Minus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';

// Custom extension to handle backspace behavior in lists and Enter key behavior
const CustomKeymap = Extension.create({
  name: 'customKeymap',
  
  addKeyboardShortcuts() {
    return {
      'Tab': ({ editor }) => {
        // Insert tab as 4 spaces (standard tab width)
        return editor.commands.insertContent('    ');
      },
      'Enter': ({ editor }) => {
        // Make Enter behave like Shift+Enter (create hard break instead of paragraph)
        return editor.commands.setHardBreak();
      },
      'Shift-Enter': ({ editor }) => {
        // Make Shift+Enter also create hard break (same as Enter)
        return editor.commands.setHardBreak();
      },
      'Mod-Enter': ({ editor }) => {
        // Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) creates a new paragraph with spacing
        return editor.commands.createParagraphNear();
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
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className = ""
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);
  const [editorState, setEditorState] = useState(0); // Track editor state changes for re-renders
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
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
        includeChildren: true,
      }),
      Link.configure({
        openOnClick: false,
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
      setEditorState(prev => prev + 1); // Force toolbar re-render
    },
    onSelectionUpdate: () => {
      setEditorState(prev => prev + 1); // Force toolbar re-render on selection change  
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] px-6 py-4 ${className}`,
      },
    },
  });

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  }, [editor, linkUrl]);

  // Force re-render when editor state changes
  useEffect(() => {
    if (editor) {
      const updateState = () => setEditorState(prev => prev + 1);
      
      editor.on('transaction', updateState);
      editor.on('selectionUpdate', updateState);
      
      return () => {
        editor.off('transaction', updateState);
        editor.off('selectionUpdate', updateState);
      };
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const MenuButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children, 
    title,
    variant = 'default'
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
    variant?: 'default' | 'primary';
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2.5 rounded-lg transition-all duration-200 ${
        variant === 'primary' 
          ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm' 
          : isActive 
            ? 'bg-accent text-accent-foreground shadow-sm' 
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
    >
      {children}
    </button>
  );

  const DropdownButton = ({ 
    label, 
    children 
  }: { 
    label: string; 
    children: React.ReactNode;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors border border-border"
        >
          {label}
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-20 min-w-[200px] py-2 max-h-[300px] overflow-y-auto">
              {children}
            </div>
          </>
        )}
      </div>
    );
  };

  // Helper function to get current highlight color
  const getCurrentHighlightColor = () => {
    if (editor && editor.isActive('highlight')) {
      const { color } = editor.getAttributes('highlight');
      return color || '#fef08a'; // Default to yellow if no specific color
    }
    return null;
  };

  // Helper function to get current format
  const getCurrentFormat = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('bulletList')) return 'Bullet List';
    if (editor.isActive('orderedList')) return 'Numbered List';
    if (editor.isActive('taskList')) return 'Task List';
    if (editor.isActive('blockquote')) return 'Quote';
    return 'Paragraph';
  };

  return (
    <div className="rich-text-editor border border-border rounded-xl bg-background overflow-hidden shadow-sm">
      {/* Modern Toolbar */}
      <div className="border-b border-border bg-muted/30 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text Type Dropdown */}
          <DropdownButton label={getCurrentFormat()}>
            <button
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                editor.isActive('paragraph') && !editor.isActive('bulletList') && !editor.isActive('orderedList') && !editor.isActive('taskList') ? 'bg-accent/20 text-accent' : ''
              }`}
            >
              <Type size={16} />
              <span>Paragraph</span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-accent/20 text-accent' : ''
              }`}
            >
              <Heading1 size={16} />
              <span>Heading 1</span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-accent/20 text-accent' : ''
              }`}
            >
              <Heading2 size={16} />
              <span>Heading 2</span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                editor.isActive('heading', { level: 3 }) ? 'bg-accent/20 text-accent' : ''
              }`}
            >
              <Heading3 size={16} />
              <span>Heading 3</span>
            </button>
            <hr className="my-2 border-border" />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                editor.isActive('bulletList') ? 'bg-accent/20 text-accent' : ''
              }`}
            >
              <List size={16} />
              <span>Bullet List</span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                editor.isActive('orderedList') ? 'bg-accent/20 text-accent' : ''
              }`}
            >
              <ListOrdered size={16} />
              <span>Numbered List</span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                editor.isActive('taskList') ? 'bg-accent/20 text-accent' : ''
              }`}
            >
              <CheckSquare size={16} />
              <span>Task List</span>
            </button>
            <hr className="my-2 border-border" />
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                editor.isActive('blockquote') ? 'bg-accent/20 text-accent' : ''
              }`}
            >
              <Quote size={16} />
              <span>Quote</span>
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
            >
              <Minus size={16} />
              <span>Divider</span>
            </button>
          </DropdownButton>

          <div className="w-px h-8 bg-border mx-1" />

          {/* Formatting Buttons */}
          <div className="flex gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (⌘B)"
            >
              <Bold size={16} />
            </MenuButton>
            
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (⌘I)"
            >
              <Italic size={16} />
            </MenuButton>
            
            <MenuButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline"
            >
              <UnderlineIcon size={16} />
            </MenuButton>
            
            <MenuButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </MenuButton>
            
            <MenuButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Inline Code"
            >
              <Code size={16} />
            </MenuButton>
          </div>

          <div className="w-px h-8 bg-border mx-1" />

          {/* Advanced Actions */}
          <div className="flex gap-1">
            {/* Highlight Color Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowHighlightDropdown(!showHighlightDropdown)}
                className={`p-2.5 rounded-lg transition-all duration-200 relative ${
                  editor.isActive('highlight')
                    ? 'bg-accent text-accent-foreground shadow-sm' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                } hover:scale-105 active:scale-95`}
                title={editor.isActive('highlight') ? `Current: ${getCurrentHighlightColor()}` : "Highlight Colors"}
              >
                <Highlighter size={16} />
                {/* Show current highlight color as a small indicator */}
                {editor.isActive('highlight') && (
                  <div 
                    className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: getCurrentHighlightColor() }}
                  />
                )}
              </button>
              
              {showHighlightDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowHighlightDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-20 min-w-[160px] p-3">
                    <div className="text-xs text-muted-foreground mb-3 font-medium">
                      {editor.isActive('highlight') ? 'Change Highlight Color' : 'Highlight Colors'}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { color: '#fbbf24', name: 'Yellow' },  // amber-400 - good contrast in both modes
                        { color: '#60a5fa', name: 'Blue' },    // blue-400 - good contrast in both modes  
                        { color: '#34d399', name: 'Green' },   // emerald-400 - good contrast in both modes
                        { color: '#f87171', name: 'Red' },     // red-400 - good contrast in both modes
                        { color: '#a78bfa', name: 'Purple' },  // violet-400 - good contrast in both modes
                        { color: '#fb923c', name: 'Orange' }   // orange-400 - good contrast in both modes
                      ].map((highlightColor) => {
                        const isCurrentColor = getCurrentHighlightColor() === highlightColor.color;
                        return (
                          <button
                            key={highlightColor.color}
                            onClick={() => {
                              if (editor.isActive('highlight')) {
                                // If text is already highlighted, change the color
                                editor.chain().focus().unsetHighlight().toggleHighlight({ color: highlightColor.color }).run();
                              } else {
                                // If text is not highlighted, apply new highlight
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
                            {/* Show checkmark for current color */}
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
          </div>
        </div>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground mb-4 focus:ring-2 focus:ring-accent focus:border-accent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLink();
                }
              }}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addLink}
                className="px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="focus-within:ring-0 min-h-[300px]"
        />
      </div>

      {/* Status Bar */}
      <div className="border-t border-border p-3 bg-muted/20 text-xs text-muted-foreground">
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
