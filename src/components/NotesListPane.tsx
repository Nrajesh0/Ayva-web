import React, { useState } from 'react';
import { NoteEntity } from '../types/notes';
import { NotesnookBlockManager } from '../utils/notesnookBlockManager';
import { getKeepTheme } from '../utils/keepThemes';
import {
  Search,
  Pin,
  CheckSquare,
  Tag,
  ArrowUpDown,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface NotesListPaneProps {
  notes: NoteEntity[];
  selectedNoteId: number | string | null;
  onSelectNote: (note: NoteEntity) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  title: string;
}

type SortOption = 'updated' | 'created' | 'title';

export const NotesListPane: React.FC<NotesListPaneProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  selectedTag,
  onSelectTag,
  title
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');

  // Filter & sort
  const filteredNotes = notes
    .filter(note => {
      // Tag filter
      if (selectedTag) {
        try {
          const tags: string[] = JSON.parse(note.labelsJson || '[]');
          if (!tags.includes(selectedTag)) return false;
        } catch {
          return false;
        }
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (note.title || '').toLowerCase().includes(q);
        const matchesContent = (note.content || '').toLowerCase().includes(q);
        return matchesTitle || matchesContent;
      }

      return true;
    })
    .sort((a, b) => {
      // Always keep pinned items on top if in normal all_notes
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      if (sortBy === 'created') return b.createdAt - a.createdAt;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return b.updatedAt - a.updatedAt;
    });

  return (
    <div
      id="desktop-notes-list-pane"
      className="flex h-full w-80 flex-col border-r border-[#262B35] bg-[#0F1115] lg:w-96 select-none"
    >
      {/* Header & Search */}
      <div className="border-b border-[#262B35] bg-[#12151B] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#F9FAFB]">{title}</h2>
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <ArrowUpDown className="h-3 w-3" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="rounded bg-[#1E232D] px-2 py-0.5 text-xs text-[#9CA3AF] outline-none hover:text-white"
            >
              <option value="updated">Recently Edited</option>
              <option value="created">Date Created</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="flex items-center gap-2 rounded-xl border border-[#262B35] bg-[#161920] px-3 py-2 text-xs focus-within:border-[#22C55E]">
          <Search className="h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes, tags, blocks..."
            className="w-full bg-transparent text-xs text-[#F9FAFB] placeholder-[#6B7280] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-[#9CA3AF] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tag filter chip indicator if active */}
        {selectedTag && (
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-[#1E232D] px-2.5 py-1 text-xs text-[#22C55E]">
            <div className="flex items-center gap-1.5">
              <Tag className="h-3 w-3" />
              <span>Filtered by #{selectedTag}</span>
            </div>
            <button
              onClick={() => onSelectTag(null)}
              className="text-[11px] text-[#9CA3AF] hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-[#9CA3AF]">
            <FileText className="h-8 w-8 text-[#6B7280]/40" />
            <span className="mt-2 text-xs">No notes found</span>
          </div>
        ) : (
          filteredNotes.map(n => {
            const isSelected = selectedNoteId === n.id;
            const theme = getKeepTheme(n.colorKey);
            const plainSnippet = NotesnookBlockManager.rawToPlainText(n.content);

            let tagList: string[] = [];
            try {
              tagList = JSON.parse(n.labelsJson || '[]');
            } catch {}

            let checklistPreview: { total: number; checked: number } | null = null;
            if (n.isChecklist && n.checklistJson) {
              try {
                const items = JSON.parse(n.checklistJson);
                if (Array.isArray(items) && items.length > 0) {
                  checklistPreview = {
                    total: items.length,
                    checked: items.filter((i: any) => i.isChecked).length
                  };
                }
              } catch {}
            }

            return (
              <div
                key={n.id}
                id={`note-card-${n.id}`}
                onClick={() => onSelectNote(n)}
                className={`group relative cursor-pointer rounded-xl border p-3 transition-all ${
                  isSelected
                    ? 'border-[#22C55E] bg-[#161920] shadow-md shadow-[#22C55E]/5 ring-1 ring-[#22C55E]'
                    : 'border-[#262B35] bg-[#161920]/70 hover:border-[#333A48] hover:bg-[#161920]'
                }`}
                style={{
                  borderLeftColor: theme.key !== 'default' ? theme.swatchColor : undefined,
                  borderLeftWidth: theme.key !== 'default' ? '4px' : undefined
                }}
              >
                {/* Note Title & Pin Indicator */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold text-[#F9FAFB]">
                    {n.title || 'Untitled Note'}
                  </h3>
                  {n.isPinned && (
                    <Pin className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                  )}
                </div>

                {/* Content Snippet */}
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#9CA3AF]">
                  {plainSnippet || 'Empty note...'}
                </p>

                {/* Checklist progress pill */}
                {checklistPreview && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#22C55E]">
                    <CheckSquare className="h-3 w-3" />
                    <span>
                      {checklistPreview.checked}/{checklistPreview.total} completed
                    </span>
                  </div>
                )}

                {/* Footer Badges & Date */}
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#6B7280]">
                  <div className="flex flex-wrap items-center gap-1">
                    {tagList.slice(0, 2).map(t => (
                      <span
                        key={t}
                        className="rounded bg-[#1E232D] px-1.5 py-0.5 text-[#9CA3AF]"
                      >
                        #{t}
                      </span>
                    ))}
                    {tagList.length > 2 && (
                      <span className="text-[#6B7280]">+{tagList.length - 2}</span>
                    )}
                  </div>

                  <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
