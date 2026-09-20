import React from 'react';
import {
  FileText,
  Pin,
  CheckSquare,
  Archive,
  Trash2,
  Lock,
  Unlock,
  Plus,
  Command,
  Download,
  ShieldCheck,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export type MainNavView = 'all_notes' | 'pinned' | 'checklists' | 'todos' | 'archived' | 'trash';

interface SidebarRailProps {
  currentView: MainNavView;
  onSelectView: (view: MainNavView) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  availableTags: string[];
  notesCount: number;
  todosCount: number;
  onCreateNewNote: () => void;
  isVaultUnlocked: boolean;
  onOpenVaultModal: () => void;
  onOpenCommandPalette: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  currentView,
  onSelectView,
  selectedTag,
  onSelectTag,
  availableTags,
  notesCount,
  todosCount,
  onCreateNewNote,
  isVaultUnlocked,
  onOpenVaultModal,
  onOpenCommandPalette
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <div
      id="desktop-sidebar-rail"
      className="flex h-full w-64 flex-col border-r border-[#262B35] bg-[#12151B] p-3.5 select-none"
    >
      {/* Brand Header */}
      <div className="mb-4 flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#22C55E]/40 bg-[#161920] shadow-sm">
            <span className="font-bold text-base text-[#22C55E]">R</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-[#F9FAFB]">RuN</span>
              <span className="rounded bg-[#22C55E]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#22C55E]">E2EE</span>
            </div>
            <span className="text-[11px] text-[#9CA3AF]">Zero-Knowledge Notes</span>
          </div>
        </div>
      </div>

      {/* Primary Action: New Note */}
      <button
        id="btn-create-new-note"
        onClick={onCreateNewNote}
        className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] py-2.5 px-4 text-xs font-bold text-[#0F1115] shadow-lg shadow-[#22C55E]/10 transition hover:bg-[#16A34A]"
      >
        <Plus className="h-4 w-4" />
        New Note
      </button>

      {/* Navigation Links */}
      <div className="flex-1 space-y-1 overflow-y-auto">
        <button
          onClick={() => {
            onSelectTag(null);
            onSelectView('all_notes');
          }}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
            currentView === 'all_notes' && !selectedTag
              ? 'bg-[#1E232D] font-bold text-[#22C55E]'
              : 'text-[#9CA3AF] hover:bg-[#161920] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-[#22C55E]" />
            <span>All Notes</span>
          </div>
          <span className="rounded-full bg-[#161920] px-2 py-0.5 text-[10px] text-[#6B7280]">
            {notesCount}
          </span>
        </button>

        <button
          onClick={() => {
            onSelectTag(null);
            onSelectView('pinned');
          }}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
            currentView === 'pinned'
              ? 'bg-[#1E232D] font-bold text-[#22C55E]'
              : 'text-[#9CA3AF] hover:bg-[#161920] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Pin className="h-4 w-4 text-amber-400" />
            <span>Pinned</span>
          </div>
        </button>

        <button
          onClick={() => {
            onSelectTag(null);
            onSelectView('checklists');
          }}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
            currentView === 'checklists'
              ? 'bg-[#1E232D] font-bold text-[#22C55E]'
              : 'text-[#9CA3AF] hover:bg-[#161920] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckSquare className="h-4 w-4 text-blue-400" />
            <span>Checklists</span>
          </div>
        </button>

        <button
          onClick={() => {
            onSelectTag(null);
            onSelectView('todos');
          }}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
            currentView === 'todos'
              ? 'bg-[#1E232D] font-bold text-[#22C55E]'
              : 'text-[#9CA3AF] hover:bg-[#161920] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
            <span>Focus Tasks</span>
          </div>
          <span className="rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">
            {todosCount}
          </span>
        </button>

        <div className="my-3 border-b border-[#262B35]" />

        {/* Labels / Tags Section */}
        {availableTags.length > 0 && (
          <div className="mb-2">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              Tags
            </div>
            <div className="space-y-0.5">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    onSelectView('all_notes');
                    onSelectTag(selectedTag === tag ? null : tag);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition ${
                    selectedTag === tag
                      ? 'bg-[#1E232D] font-semibold text-[#22C55E]'
                      : 'text-[#9CA3AF] hover:bg-[#161920] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Tag className="h-3 w-3 shrink-0 text-[#6B7280]" />
                    <span className="truncate">#{tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="my-2 border-b border-[#262B35]" />

        <button
          onClick={() => {
            onSelectTag(null);
            onSelectView('archived');
          }}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
            currentView === 'archived'
              ? 'bg-[#1E232D] font-bold text-[#22C55E]'
              : 'text-[#9CA3AF] hover:bg-[#161920] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Archive className="h-4 w-4 text-[#6B7280]" />
            <span>Archive</span>
          </div>
        </button>

        <button
          onClick={() => {
            onSelectTag(null);
            onSelectView('trash');
          }}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
            currentView === 'trash'
              ? 'bg-[#1E232D] font-bold text-[#22C55E]'
              : 'text-[#9CA3AF] hover:bg-[#161920] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Trash2 className="h-4 w-4 text-[#6B7280]" />
            <span>Trash</span>
          </div>
        </button>
      </div>

      {/* Footer Controls: Command Palette, PWA Install, Vault */}
      <div className="space-y-1.5 border-t border-[#262B35] pt-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex w-full items-center justify-between rounded-xl border border-[#262B35] bg-[#161920] px-3 py-2 text-xs text-[#9CA3AF] transition hover:border-[#333A48] hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Command className="h-3.5 w-3.5 text-[#22C55E]" />
            <span>Quick Commands</span>
          </div>
          <kbd className="rounded bg-[#1E232D] px-1.5 py-0.5 text-[10px] text-[#6B7280]">
            ⌘K
          </kbd>
        </button>

        {/* In-App PWA Install button */}
        {isInstallable && !isInstalled && (
          <button
            onClick={install}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 py-2 text-xs font-semibold text-[#22C55E] transition hover:bg-[#22C55E]/20"
          >
            <Download className="h-3.5 w-3.5" />
            Install Desktop App
          </button>
        )}

        {/* Vault Status */}
        <button
          id="btn-vault-security"
          onClick={onOpenVaultModal}
          className="flex w-full items-center justify-between rounded-xl border border-[#262B35] bg-[#161920] px-3 py-2 text-xs transition hover:border-[#22C55E]"
        >
          <div className="flex items-center gap-2">
            {isVaultUnlocked ? (
              <Unlock className="h-3.5 w-3.5 text-[#22C55E]" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span className={isVaultUnlocked ? 'text-[#22C55E]' : 'text-amber-400 font-medium'}>
              {isVaultUnlocked ? 'Vault Active' : 'Vault Locked'}
            </span>
          </div>
          <span className="text-[10px] text-[#6B7280]">E2EE</span>
        </button>
      </div>
    </div>
  );
};
