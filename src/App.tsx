import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabaseWithSeed } from './db/database';
import { NoteEntity } from './types/notes';
import { TaskEntity } from './types/tasks';
import { generateId, NotesnookBlockManager } from './utils/notesnookBlockManager';
import { VaultSecurity } from './crypto/vaultSecurity';
import { SidebarRail, MainNavView } from './components/SidebarRail';
import { NotesListPane } from './components/NotesListPane';
import { NotesnookEditor } from './components/NotesnookEditor';
import { TodoListPane } from './components/TodoListPane';
import { VaultSecurityModal } from './components/VaultSecurityModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<MainNavView>('all_notes');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | string | null>(null);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(true);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

  // Initialize DB seed on mount
  useEffect(() => {
    initializeDatabaseWithSeed();
  }, []);

  // Live query for Notes
  const allNotes = useLiveQuery(() => db.notes.toArray(), []) || [];
  const allTasks = useLiveQuery(() => db.tasks.toArray(), []) || [];

  // Filter notes based on sidebar rail view
  const visibleNotes = allNotes.filter(note => {
    if (currentView === 'trash') return note.isTrashed;
    if (note.isTrashed) return false;

    if (currentView === 'archived') return note.isArchived;
    if (note.isArchived) return false;

    if (currentView === 'pinned') return note.isPinned;
    if (currentView === 'checklists') return note.isChecklist;

    return true;
  });

  // Extract all unique tags
  const availableTags = Array.from(
    new Set(
      allNotes
        .filter(n => !n.isTrashed)
        .flatMap(n => {
          try {
            return JSON.parse(n.labelsJson || '[]');
          } catch {
            return [];
          }
        })
    )
  ) as string[];

  // Auto-select first note if none selected or if selected was deleted
  const selectedNote = allNotes.find(n => n.id === selectedNoteId) || visibleNotes[0] || null;

  useEffect(() => {
    if (!selectedNoteId && visibleNotes.length > 0) {
      setSelectedNoteId(visibleNotes[0].id);
    }
  }, [visibleNotes.length, selectedNoteId]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      // Ctrl/Cmd + N: New Note
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        handleCreateNote();
      }
      // Ctrl/Cmd + Shift + T: Focus Tasks view
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setCurrentView('todos');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleNotes]);

  // Note actions
  const handleCreateNote = async () => {
    const id = 'note_' + generateId();
    const newNote: NoteEntity = {
      id,
      title: 'Untitled Note',
      content: '',
      isChecklist: false,
      checklistJson: '[]',
      colorKey: 'default',
      fontKey: 'default',
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      labelsJson: selectedTag ? JSON.stringify([selectedTag]) : '[]',
      imageUrisJson: '[]',
      audioUrisJson: '[]',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.notes.put(newNote);
    setSelectedNoteId(id);
    if (currentView === 'todos') {
      setCurrentView('all_notes');
    }
  };

  const handleSaveNote = async (updated: NoteEntity) => {
    await db.notes.put(updated);
  };

  const handleDeleteNote = async (id: number | string) => {
    const target = allNotes.find(n => n.id === id);
    if (!target) return;

    if (target.isTrashed) {
      // Permanently remove
      await db.notes.delete(id);
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    } else {
      // Move to trash
      await db.notes.update(id, { isTrashed: true, updatedAt: Date.now() });
    }
  };

  // Task actions
  const handleAddTask = async (taskData: Omit<TaskEntity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = 'task_' + generateId();
    const newTask: TaskEntity = {
      ...taskData,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.tasks.put(newTask);
  };

  const handleUpdateTask = async (task: TaskEntity) => {
    await db.tasks.put(task);
  };

  const handleDeleteTask = async (id: number | string) => {
    await db.tasks.delete(id);
  };

  // Vault Unlock / Lock
  const handleUnlockVault = async (passphrase: string): Promise<boolean> => {
    try {
      const salt = VaultSecurity.generateSalt();
      const key = await VaultSecurity.deriveKey(passphrase, salt);
      setMasterKey(key);
      setIsVaultUnlocked(true);
      return true;
    } catch {
      return false;
    }
  };

  const handleLockVault = () => {
    setMasterKey(null);
    setIsVaultUnlocked(false);
  };

  const handleImportVaultData = async (data: { notes: NoteEntity[]; tasks: TaskEntity[] }) => {
    if (data.notes && data.notes.length > 0) {
      await db.notes.bulkPut(data.notes);
    }
    if (data.tasks && data.tasks.length > 0) {
      await db.tasks.bulkPut(data.tasks);
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'pinned':
        return 'Pinned Notes';
      case 'checklists':
        return 'Checklists';
      case 'archived':
        return 'Archived Notes';
      case 'trash':
        return 'Trash';
      case 'all_notes':
      default:
        return 'All Notes';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0F1115] text-[#F9FAFB]">
      {/* 1. Left Sidebar Rail */}
      <SidebarRail
        currentView={currentView}
        onSelectView={setCurrentView}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        availableTags={availableTags}
        notesCount={allNotes.filter(n => !n.isTrashed && !n.isArchived).length}
        todosCount={allTasks.filter(t => !t.isCompleted).length}
        onCreateNewNote={handleCreateNote}
        isVaultUnlocked={isVaultUnlocked}
        onOpenVaultModal={() => setShowVaultModal(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
      />

      {/* 2. Middle & Right Panes */}
      {currentView === 'todos' ? (
        <div className="flex-1 overflow-hidden">
          <TodoListPane
            tasks={allTasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Middle List Pane */}
          <NotesListPane
            notes={visibleNotes}
            selectedNoteId={selectedNote?.id || null}
            onSelectNote={n => setSelectedNoteId(n.id)}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            title={getViewTitle()}
          />

          {/* Right Editor Pane */}
          <div className="flex-1 overflow-hidden">
            <NotesnookEditor
              note={selectedNote}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              isVaultLocked={!isVaultUnlocked}
            />
          </div>
        </div>
      )}

      {/* Zero-Knowledge Vault Modal */}
      <VaultSecurityModal
        isOpen={showVaultModal}
        onClose={() => setShowVaultModal(false)}
        isUnlocked={isVaultUnlocked}
        onUnlockVault={handleUnlockVault}
        onLockVault={handleLockVault}
        notes={allNotes}
        tasks={allTasks}
        onImportVaultData={handleImportVaultData}
      />

      {/* Universal Command Palette Modal */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        notes={allNotes}
        tasks={allTasks}
        onSelectNote={n => {
          setSelectedNoteId(n.id);
          if (currentView === 'todos') setCurrentView('all_notes');
        }}
        onCreateNote={handleCreateNote}
        onOpenVault={() => setShowVaultModal(true)}
        onSwitchView={v => setCurrentView(v)}
      />
    </div>
  );
};
