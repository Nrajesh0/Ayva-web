import React, { useState, useEffect } from 'react';
import { NoteEntity } from '../types/notes';
import { TaskEntity } from '../types/tasks';
import { MainNavView } from './SidebarRail';
import {
  Search,
  FileText,
  CheckSquare,
  Plus,
  Lock,
  Download,
  Palette,
  Sparkles,
  Command,
  ArrowRight
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteEntity[];
  tasks: TaskEntity[];
  onSelectNote: (note: NoteEntity) => void;
  onCreateNote: () => void;
  onOpenVault: () => void;
  onSwitchView: (view: MainNavView) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  notes,
  tasks,
  onSelectNote,
  onCreateNote,
  onOpenVault,
  onSwitchView
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredNotes = notes
    .filter(n => !n.isTrashed && (n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase())))
    .slice(0, 5);

  const filteredTasks = tasks
    .filter(t => !t.isCompleted && t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const actions = [
    {
      id: 'create_note',
      title: 'Create New Encrypted Note',
      icon: Plus,
      handler: () => {
        onCreateNote();
        onClose();
      }
    },
    {
      id: 'switch_todos',
      title: 'Open Focus Tasks & Todos',
      icon: CheckSquare,
      handler: () => {
        onSwitchView('todos');
        onClose();
      }
    },
    {
      id: 'open_vault',
      title: 'Open Zero-Knowledge Vault Security & Backup',
      icon: Lock,
      handler: () => {
        onOpenVault();
        onClose();
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#262B35] bg-[#161920] shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[#262B35] bg-[#12151B] px-4 py-3.5">
          <Search className="h-5 w-5 text-[#22C55E]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Type a command or search notes & tasks..."
            className="w-full bg-transparent text-sm text-[#F9FAFB] placeholder-[#6B7280] outline-none"
            autoFocus
          />
          <kbd className="rounded border border-[#262B35] bg-[#1E232D] px-2 py-0.5 text-[10px] text-[#9CA3AF]">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 text-xs">
          {/* Actions */}
          <div className="px-2 py-1.5 font-bold uppercase tracking-wider text-[#6B7280]">
            Quick Actions
          </div>
          <div className="space-y-1">
            {actions.map(act => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={act.handler}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[#F9FAFB] transition hover:bg-[#1E232D] hover:text-[#22C55E]"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-[#22C55E]" />
                    <span className="font-medium">{act.title}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                </button>
              );
            })}
          </div>

          {/* Notes matching query */}
          {filteredNotes.length > 0 && (
            <div className="mt-3">
              <div className="px-2 py-1.5 font-bold uppercase tracking-wider text-[#6B7280]">
                Matching Notes
              </div>
              <div className="space-y-1">
                {filteredNotes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      onSelectNote(n);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[#F9FAFB] transition hover:bg-[#1E232D] hover:text-[#22C55E]"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
                      <span className="truncate font-medium">{n.title || 'Untitled Note'}</span>
                    </div>
                    <span className="shrink-0 text-[10px] text-[#6B7280]">
                      {new Date(n.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks matching query */}
          {filteredTasks.length > 0 && (
            <div className="mt-3">
              <div className="px-2 py-1.5 font-bold uppercase tracking-wider text-[#6B7280]">
                Focus Tasks
              </div>
              <div className="space-y-1">
                {filteredTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSwitchView('todos');
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[#F9FAFB] transition hover:bg-[#1E232D] hover:text-[#22C55E]"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckSquare className="h-4 w-4 shrink-0 text-[#22C55E]" />
                      <span className="truncate font-medium">{t.title}</span>
                    </div>
                    {t.dueDate && (
                      <span className="shrink-0 text-[10px] text-[#6B7280]">
                        Due {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
