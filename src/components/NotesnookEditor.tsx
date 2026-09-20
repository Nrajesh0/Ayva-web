import React, { useState, useEffect, useRef } from 'react';
import { NoteEntity, NotesnookBlock, ChecklistItem, TextBlock } from '../types/notes';
import { NotesnookBlockManager, generateId } from '../utils/notesnookBlockManager';
import { getKeepTheme, getFontFamily } from '../utils/keepThemes';
import { ArticleExporter } from '../utils/articleExporter';
import { TableBlockEditor } from './TableBlockEditor';
import { MathBlockEditor } from './MathBlockEditor';
import { CodeBlockEditor } from './CodeBlockEditor';
import { CalloutBlockEditor } from './CalloutBlockEditor';
import { KeepThemePicker } from './KeepThemePicker';
import {
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  Sigma,
  Code as CodeIcon,
  AlertCircle,
  Quote,
  ListOrdered,
  Minus,
  CheckSquare,
  Palette,
  Tag,
  Pin,
  Archive,
  Trash2,
  Download,
  Share2,
  Check,
  Plus,
  X,
  FileText,
  Lock,
  Sparkles,
  Printer
} from 'lucide-react';

interface NotesnookEditorProps {
  note: NoteEntity | null;
  onSaveNote: (updated: NoteEntity) => void;
  onDeleteNote: (id: number | string) => void;
  isVaultLocked?: boolean;
}

export const NotesnookEditor: React.FC<NotesnookEditorProps> = ({
  note,
  onSaveNote,
  onDeleteNote,
  isVaultLocked = false
}) => {
  if (!note) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#0F1115] p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-[#262B35] bg-[#161920] shadow-xl">
          <FileText className="h-10 w-10 text-[#22C55E]/70" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-[#F9FAFB]">No Note Selected</h2>
        <p className="mt-2 max-w-sm text-sm text-[#9CA3AF]">
          Select an existing note from the sidebar or press <kbd className="rounded bg-[#262B35] px-1.5 py-0.5 text-xs text-white">Ctrl + N</kbd> to create a new encrypted note.
        </p>
      </div>
    );
  }

  const [title, setTitle] = useState(note.title);
  const [blocks, setBlocks] = useState<NotesnookBlock[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isChecklist, setIsChecklist] = useState(note.isChecklist);
  const [colorKey, setColorKey] = useState(note.colorKey || 'default');
  const [fontKey, setFontKey] = useState(note.fontKey || 'default');
  const [isPinned, setIsPinned] = useState(note.isPinned);
  const [isArchived, setIsArchived] = useState(note.isArchived);
  const [labels, setLabels] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [newChecklistText, setNewChecklistText] = useState('');

  const saveTimerRef = useRef<any>(null);
  const theme = getKeepTheme(colorKey);
  const fontFamily = getFontFamily(fontKey);

  // Sync state whenever active note changes
  useEffect(() => {
    setTitle(note.title);
    setColorKey(note.colorKey || 'default');
    setFontKey(note.fontKey || 'default');
    setIsPinned(note.isPinned);
    setIsArchived(note.isArchived);
    setIsChecklist(note.isChecklist);

    try {
      const parsedLabels = JSON.parse(note.labelsJson || '[]');
      setLabels(Array.isArray(parsedLabels) ? parsedLabels : []);
    } catch {
      setLabels([]);
    }

    try {
      const parsedChecklist = JSON.parse(note.checklistJson || '[]');
      setChecklistItems(Array.isArray(parsedChecklist) ? parsedChecklist : []);
    } catch {
      setChecklistItems([]);
    }

    const parsedBlocks = NotesnookBlockManager.parse(note.content);
    setBlocks(parsedBlocks);
  }, [note.id]);

  // Debounced auto-save
  const triggerSave = (
    newTitle = title,
    newBlocks = blocks,
    newChecklist = checklistItems,
    newIsChecklist = isChecklist,
    newColor = colorKey,
    newFont = fontKey,
    newPinned = isPinned,
    newArchived = isArchived,
    newLabels = labels
  ) => {
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      const serializedContent = NotesnookBlockManager.serialize(newBlocks);
      const updatedNote: NoteEntity = {
        ...note,
        title: newTitle,
        content: serializedContent,
        isChecklist: newIsChecklist,
        checklistJson: JSON.stringify(newChecklist),
        colorKey: newColor,
        fontKey: newFont,
        isPinned: newPinned,
        isArchived: newArchived,
        labelsJson: JSON.stringify(newLabels),
        updatedAt: Date.now()
      };
      onSaveNote(updatedNote);
      setSaveStatus('saved');
    }, 400);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerSave(val);
  };

  const handleBlockChange = (index: number, updated: NotesnookBlock) => {
    const next = [...blocks];
    next[index] = updated;
    setBlocks(next);
    triggerSave(title, next);
  };

  const handleBlockDelete = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    if (next.length === 0) {
      next.push({ id: generateId(), type: 'text', text: '', spans: [] });
    }
    setBlocks(next);
    triggerSave(title, next);
  };

  const addBlock = (type: NotesnookBlock['type'], extra?: any) => {
    const id = generateId();
    let newBlock: NotesnookBlock;

    switch (type) {
      case 'table':
        newBlock = {
          id,
          type: 'table',
          rows: 3,
          cols: 3,
          data: [
            ['Header 1', 'Header 2', 'Header 3'],
            ['', '', ''],
            ['', '', '']
          ]
        };
        break;
      case 'math':
        newBlock = {
          id,
          type: 'math',
          formula: extra?.formula || 'E = mc^2'
        };
        break;
      case 'code':
        newBlock = {
          id,
          type: 'code',
          language: extra?.language || 'Kotlin',
          code: ''
        };
        break;
      case 'callout':
        newBlock = {
          id,
          type: 'callout',
          calloutType: extra?.calloutType || 'tip',
          text: ''
        };
        break;
      case 'quote':
        newBlock = {
          id,
          type: 'quote',
          text: ''
        };
        break;
      case 'horizontal_rule':
        newBlock = {
          id,
          type: 'horizontal_rule'
        };
        break;
      case 'outline':
        newBlock = {
          id,
          type: 'outline',
          level: 0,
          text: '',
          isNumbered: false
        };
        break;
      default:
        newBlock = {
          id,
          type: 'text',
          text: '',
          spans: []
        };
        break;
    }

    const next = [...blocks, newBlock];
    setBlocks(next);
    triggerSave(title, next);
  };

  const addHeading = (level: 1 | 2 | 3) => {
    const id = generateId();
    const spanType = level === 1 ? 'HEADING_1' : level === 2 ? 'HEADING_2' : 'HEADING_3';
    const text = level === 1 ? 'Heading 1' : level === 2 ? 'Heading 2' : 'Heading 3';
    const headingBlock: TextBlock = {
      id,
      type: 'text',
      text,
      spans: [{ type: spanType, start: 0, end: text.length }]
    };
    const next = [...blocks, headingBlock];
    setBlocks(next);
    triggerSave(title, next);
  };

  // Checklist handlers
  const toggleChecklistItem = (id: string) => {
    const updated = checklistItems.map(item =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    setChecklistItems(updated);
    triggerSave(title, blocks, updated);
  };

  const updateChecklistItemText = (id: string, text: string) => {
    const updated = checklistItems.map(item =>
      item.id === id ? { ...item, text } : item
    );
    setChecklistItems(updated);
    triggerSave(title, blocks, updated);
  };

  const deleteChecklistItem = (id: string) => {
    const updated = checklistItems.filter(item => item.id !== id);
    setChecklistItems(updated);
    triggerSave(title, blocks, updated);
  };

  const addChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: generateId(),
      text: newChecklistText.trim(),
      isChecked: false
    };
    const updated = [...checklistItems, newItem];
    setChecklistItems(updated);
    setNewChecklistText('');
    triggerSave(title, blocks, updated);
  };

  // Tag labels
  const addTag = () => {
    const clean = newTagInput.trim().replace(/^#/, '');
    if (clean && !labels.includes(clean)) {
      const next = [...labels, clean];
      setLabels(next);
      triggerSave(title, blocks, checklistItems, isChecklist, colorKey, fontKey, isPinned, isArchived, next);
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const next = labels.filter(t => t !== tagToRemove);
    setLabels(next);
    triggerSave(title, blocks, checklistItems, isChecklist, colorKey, fontKey, isPinned, isArchived, next);
  };

  // Metrics
  const plainText = NotesnookBlockManager.toPlainText(blocks);
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      id="notesnook-editor-canvas"
      className="relative flex h-full flex-col overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: theme.darkBg,
        color: theme.darkText
      }}
    >
      {/* Top Header Controls */}
      <div className="flex items-center justify-between border-b border-[#262B35]/70 bg-[#0F1115]/80 px-6 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* Theme & Palette Button */}
          <div className="relative">
            <button
              id="btn-open-theme-picker"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="flex items-center gap-1.5 rounded-lg border border-[#262B35] bg-[#161920] px-3 py-1.5 text-xs font-medium text-[#F9FAFB] transition hover:border-[#22C55E]"
            >
              <Palette className="h-3.5 w-3.5 text-[#22C55E]" />
              <span>{theme.name}</span>
            </button>
            {showThemePicker && (
              <div className="absolute left-0 top-10 z-40">
                <KeepThemePicker
                  selectedThemeKey={colorKey}
                  selectedFontKey={fontKey}
                  onSelectTheme={key => {
                    setColorKey(key);
                    triggerSave(title, blocks, checklistItems, isChecklist, key);
                  }}
                  onSelectFont={key => {
                    setFontKey(key);
                    triggerSave(title, blocks, checklistItems, isChecklist, colorKey, key);
                  }}
                  onClose={() => setShowThemePicker(false)}
                />
              </div>
            )}
          </div>

          {/* Checklist Mode Toggle */}
          <button
            onClick={() => {
              const next = !isChecklist;
              setIsChecklist(next);
              triggerSave(title, blocks, checklistItems, next);
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              isChecklist
                ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E]'
                : 'border-[#262B35] bg-[#161920] text-[#9CA3AF] hover:text-white'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Checklist
          </button>

          {/* Pin Button */}
          <button
            onClick={() => {
              const next = !isPinned;
              setIsPinned(next);
              triggerSave(title, blocks, checklistItems, isChecklist, colorKey, fontKey, next);
            }}
            className={`rounded-lg border p-1.5 transition ${
              isPinned
                ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E]'
                : 'border-[#262B35] bg-[#161920] text-[#9CA3AF] hover:text-white'
            }`}
            title={isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            <Pin className="h-4 w-4" />
          </button>

          {/* Archive Button */}
          <button
            onClick={() => {
              const next = !isArchived;
              setIsArchived(next);
              triggerSave(title, blocks, checklistItems, isChecklist, colorKey, fontKey, isPinned, next);
            }}
            className={`rounded-lg border p-1.5 transition ${
              isArchived
                ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                : 'border-[#262B35] bg-[#161920] text-[#9CA3AF] hover:text-white'
            }`}
            title={isArchived ? 'Unarchive' : 'Archive'}
          >
            <Archive className="h-4 w-4" />
          </button>
        </div>

        {/* Right side Actions: Auto-save status, Export, Trash */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            {saveStatus === 'saved' ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#22C55E]" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
                <span>Saving...</span>
              </>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 rounded-lg border border-[#262B35] bg-[#161920] px-3 py-1.5 text-xs font-medium text-[#F9FAFB] transition hover:border-[#22C55E]"
            >
              <Download className="h-3.5 w-3.5 text-[#22C55E]" />
              Export
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-10 z-40 w-52 rounded-xl border border-[#262B35] bg-[#161920] p-1.5 shadow-2xl">
                <button
                  onClick={() => {
                    const md = ArticleExporter.toMarkdown(note, false);
                    ArticleExporter.downloadFile(md, `${note.title || 'note'}.md`, 'text/markdown');
                    setShowExportMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#F9FAFB] hover:bg-[#1E232D]"
                >
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  Markdown (.md)
                </button>
                <button
                  onClick={() => {
                    const md = ArticleExporter.toMarkdown(note, true);
                    ArticleExporter.downloadFile(md, `${note.title || 'note'}.md`, 'text/markdown');
                    setShowExportMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#F9FAFB] hover:bg-[#1E232D]"
                >
                  <FileText className="h-3.5 w-3.5 text-indigo-400" />
                  Markdown + Frontmatter
                </button>
                <button
                  onClick={() => {
                    const html = ArticleExporter.toHtml(note);
                    ArticleExporter.downloadFile(html, `${note.title || 'note'}.html`, 'text/html');
                    setShowExportMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#F9FAFB] hover:bg-[#1E232D]"
                >
                  <FileText className="h-3.5 w-3.5 text-orange-400" />
                  Styled HTML Document
                </button>
                <button
                  onClick={() => {
                    const txt = ArticleExporter.toPlainText(note);
                    ArticleExporter.downloadFile(txt, `${note.title || 'note'}.txt`, 'text/plain');
                    setShowExportMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#F9FAFB] hover:bg-[#1E232D]"
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  Plain Text (.txt)
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setShowExportMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#F9FAFB] hover:bg-[#1E232D]"
                >
                  <Printer className="h-3.5 w-3.5 text-purple-400" />
                  Print / Save as PDF
                </button>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={() => onDeleteNote(note.id)}
            className="rounded-lg border border-[#262B35] bg-[#161920] p-1.5 text-[#9CA3AF] transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
            title="Delete Note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sticky Block Insertion Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#262B35]/70 bg-[#12151B]/95 px-6 py-2 backdrop-blur-md">
        <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
          Blocks
        </span>
        <button
          onClick={() => addHeading(1)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#D1D5DB] transition hover:bg-[#1E232D] hover:text-[#22C55E]"
          title="Heading 1"
        >
          <Heading1 className="h-3.5 w-3.5" /> H1
        </button>
        <button
          onClick={() => addHeading(2)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#D1D5DB] transition hover:bg-[#1E232D] hover:text-[#22C55E]"
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" /> H2
        </button>
        <button
          onClick={() => addHeading(3)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#D1D5DB] transition hover:bg-[#1E232D] hover:text-[#22C55E]"
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" /> H3
        </button>

        <div className="mx-1 h-4 w-px bg-[#262B35]" />

        <button
          id="toolbar-add-table"
          onClick={() => addBlock('table')}
          className="flex items-center gap-1.5 rounded-md bg-[#1E232D] px-2.5 py-1 text-xs font-semibold text-[#22C55E] transition hover:bg-[#262B35]"
          title="Insert Interactive Table"
        >
          <TableIcon className="h-3.5 w-3.5" /> Table
        </button>
        <button
          id="toolbar-add-math"
          onClick={() => addBlock('math')}
          className="flex items-center gap-1.5 rounded-md bg-[#1E232D] px-2.5 py-1 text-xs font-semibold text-[#22C55E] transition hover:bg-[#262B35]"
          title="Insert KaTeX Math Formula"
        >
          <Sigma className="h-3.5 w-3.5" /> Math
        </button>
        <button
          id="toolbar-add-code"
          onClick={() => addBlock('code')}
          className="flex items-center gap-1.5 rounded-md bg-[#1E232D] px-2.5 py-1 text-xs font-semibold text-[#22C55E] transition hover:bg-[#262B35]"
          title="Insert Code Snippet"
        >
          <CodeIcon className="h-3.5 w-3.5" /> Code
        </button>
        <button
          id="toolbar-add-callout"
          onClick={() => addBlock('callout')}
          className="flex items-center gap-1.5 rounded-md bg-[#1E232D] px-2.5 py-1 text-xs font-semibold text-[#22C55E] transition hover:bg-[#262B35]"
          title="Insert Callout Alert"
        >
          <AlertCircle className="h-3.5 w-3.5" /> Callout
        </button>
        <button
          onClick={() => addBlock('quote')}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#D1D5DB] transition hover:bg-[#1E232D] hover:text-[#22C55E]"
          title="Quote Block"
        >
          <Quote className="h-3.5 w-3.5" /> Quote
        </button>
        <button
          onClick={() => addBlock('outline')}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#D1D5DB] transition hover:bg-[#1E232D] hover:text-[#22C55E]"
          title="Outline Bullet"
        >
          <ListOrdered className="h-3.5 w-3.5" /> List
        </button>
        <button
          onClick={() => addBlock('horizontal_rule')}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#D1D5DB] transition hover:bg-[#1E232D] hover:text-[#22C55E]"
          title="Horizontal Divider"
        >
          <Minus className="h-3.5 w-3.5" /> Divider
        </button>
      </div>

      {/* Main Expansive Editor Body */}
      <div
        className="flex-1 overflow-y-auto px-10 py-8 lg:px-20"
        style={{ fontFamily }}
      >
        <div className="mx-auto max-w-4xl">
          {/* Note Title Input */}
          <input
            type="text"
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent text-3xl font-extrabold tracking-tight text-[#F9FAFB] placeholder-[#4B5563] outline-none md:text-4xl"
          />

          {/* Tags / Label Manager */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {labels.map(tag => (
              <span
                key={tag}
                className="group flex items-center gap-1 rounded-full border border-[#262B35] bg-[#161920] px-2.5 py-0.5 text-xs text-[#9CA3AF]"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-[#6B7280] transition hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {showTagInput ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addTag();
                    if (e.key === 'Escape') setShowTagInput(false);
                  }}
                  placeholder="tag-name..."
                  className="rounded-full border border-[#22C55E] bg-[#161920] px-2.5 py-0.5 text-xs text-[#F9FAFB] outline-none"
                  autoFocus
                />
                <button
                  onClick={addTag}
                  className="rounded-full bg-[#22C55E] p-1 text-[#0F1115]"
                >
                  <Check className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="flex items-center gap-1 rounded-full border border-dashed border-[#333A48] px-2.5 py-0.5 text-xs text-[#9CA3AF] transition hover:border-[#22C55E] hover:text-[#22C55E]"
              >
                <Plus className="h-3 w-3" /> Add Tag
              </button>
            )}
          </div>

          <div className="my-6 border-b border-[#262B35]/50" />

          {/* Checklist Mode Container */}
          {isChecklist && (
            <div className="mb-6 rounded-2xl border border-[#262B35] bg-[#161920]/70 p-4">
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#22C55E]">
                Checklist Items
              </div>
              <div className="space-y-2">
                {checklistItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg bg-[#0F1115]/50 px-3 py-2 transition hover:bg-[#1E232D]"
                  >
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="h-4 w-4 cursor-pointer rounded border-[#333A48] text-[#22C55E] focus:ring-[#22C55E]"
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={e => updateChecklistItemText(item.id, e.target.value)}
                      className={`flex-1 bg-transparent text-sm outline-none ${
                        item.isChecked ? 'text-[#6B7280] line-through' : 'text-[#F9FAFB]'
                      }`}
                    />
                    <button
                      onClick={() => deleteChecklistItem(item.id)}
                      className="text-[#6B7280] hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add checklist item */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={e => setNewChecklistText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addChecklistItem();
                  }}
                  placeholder="+ List item..."
                  className="flex-1 rounded-lg border border-[#262B35] bg-[#0F1115] px-3 py-2 text-sm text-[#F9FAFB] placeholder-[#6B7280] outline-none focus:border-[#22C55E]"
                />
                <button
                  onClick={addChecklistItem}
                  className="rounded-lg bg-[#22C55E] px-3 py-2 text-xs font-semibold text-[#0F1115] transition hover:bg-[#16A34A]"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Block Stack */}
          <div className="space-y-4">
            {blocks.map((block, idx) => {
              switch (block.type) {
                case 'table':
                  return (
                    <TableBlockEditor
                      key={block.id}
                      block={block}
                      onChange={updated => handleBlockChange(idx, updated)}
                      onDelete={() => handleBlockDelete(idx)}
                    />
                  );
                case 'math':
                  return (
                    <MathBlockEditor
                      key={block.id}
                      block={block}
                      onChange={updated => handleBlockChange(idx, updated)}
                      onDelete={() => handleBlockDelete(idx)}
                    />
                  );
                case 'code':
                  return (
                    <CodeBlockEditor
                      key={block.id}
                      block={block}
                      onChange={updated => handleBlockChange(idx, updated)}
                      onDelete={() => handleBlockDelete(idx)}
                    />
                  );
                case 'callout':
                  return (
                    <CalloutBlockEditor
                      key={block.id}
                      block={block}
                      onChange={updated => handleBlockChange(idx, updated)}
                      onDelete={() => handleBlockDelete(idx)}
                    />
                  );
                case 'quote':
                  return (
                    <div
                      key={block.id}
                      className="group relative my-3 flex items-start gap-3 rounded-xl border-l-4 border-[#22C55E] bg-[#161920] p-3.5"
                    >
                      <Quote className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                      <textarea
                        value={block.text}
                        onChange={e =>
                          handleBlockChange(idx, { ...block, text: e.target.value })
                        }
                        placeholder="Quote block..."
                        rows={2}
                        className="w-full resize-y bg-transparent text-sm italic leading-relaxed text-[#F9FAFB] outline-none"
                      />
                      <button
                        onClick={() => handleBlockDelete(idx)}
                        className="rounded p-1 text-[#6B7280] hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                case 'horizontal_rule':
                  return (
                    <div
                      key={block.id}
                      className="group relative my-4 flex items-center justify-between py-2"
                    >
                      <div className="h-px flex-1 bg-[#262B35]" />
                      <button
                        onClick={() => handleBlockDelete(idx)}
                        className="ml-2 rounded p-1 text-[#6B7280] opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                case 'outline':
                  return (
                    <div
                      key={block.id}
                      className="group flex items-center gap-2"
                      style={{ marginLeft: `${(block.level || 0) * 20}px` }}
                    >
                      <span className="text-[#22C55E]">•</span>
                      <input
                        type="text"
                        value={block.text}
                        onChange={e =>
                          handleBlockChange(idx, { ...block, text: e.target.value })
                        }
                        placeholder="List item..."
                        className="flex-1 bg-transparent text-sm text-[#F9FAFB] outline-none"
                      />
                      <button
                        onClick={() => handleBlockDelete(idx)}
                        className="rounded p-1 text-[#6B7280] opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                case 'text':
                default: {
                  const textContent = 'text' in block ? (block as TextBlock).text : '';
                  return (
                    <div key={block.id} className="group relative">
                      <textarea
                        value={textContent}
                        onChange={e =>
                          handleBlockChange(idx, {
                            ...block,
                            type: 'text',
                            text: e.target.value,
                            spans: 'spans' in block ? (block as TextBlock).spans : []
                          } as TextBlock)
                        }
                        placeholder="Type something, paste markdown, or add blocks from toolbar..."
                        rows={Math.max(2, (textContent || '').split('\n').length)}
                        className="w-full resize-none bg-transparent text-base leading-relaxed text-[#F9FAFB] placeholder-[#4B5563] outline-none"
                      />
                    </div>
                  );
                }
              }
            })}
          </div>

          {/* Quick Add block trigger at bottom of canvas */}
          <div className="mt-8 flex items-center justify-center py-4">
            <button
              onClick={() => addBlock('text')}
              className="flex items-center gap-2 rounded-full border border-dashed border-[#262B35] px-4 py-2 text-xs text-[#9CA3AF] transition hover:border-[#22C55E] hover:text-[#22C55E]"
            >
              <Plus className="h-3.5 w-3.5" /> Add Text Paragraph
            </button>
          </div>
        </div>
      </div>

      {/* Editor Status Footer */}
      <div className="flex items-center justify-between border-t border-[#262B35]/70 bg-[#0F1115] px-6 py-2 text-[11px] text-[#6B7280]">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span>{readTimeMin} min read</span>
          <span>{blocks.length} blocks</span>
        </div>

        <div className="flex items-center gap-2">
          <Lock className="h-3 w-3 text-[#22C55E]" />
          <span>Zero-Knowledge AES-256-GCM Encrypted</span>
        </div>
      </div>
    </div>
  );
};
