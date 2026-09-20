import Dexie, { type Table } from 'dexie';
import { NoteEntity } from '../types/notes';
import { TaskEntity } from '../types/tasks';
import { NotesnookBlockManager, generateId } from '../utils/notesnookBlockManager';

export interface VaultConfig {
  id: string;
  isVaultConfigured: boolean;
  vaultSalt?: string;
  vaultVerifierPayload?: string; // Encrypted known string to verify master password
  recoveryPhrase?: string;
  autoLockMinutes: number; // 0 = never, 5, 15, 30, 60
  themeMode: 'dark' | 'light' | 'system';
  activeFilter?: string;
  isInitialized: boolean;
}

export class NotesnookDatabase extends Dexie {
  notes!: Table<NoteEntity, number | string>;
  tasks!: Table<TaskEntity, number | string>;
  config!: Table<VaultConfig, string>;

  constructor() {
    super('RuNNotesnookDB');

    this.version(1).stores({
      notes: 'id, title, colorKey, fontKey, isPinned, isArchived, isTrashed, createdAt, updatedAt',
      tasks: 'id, dueDate, isCompleted, isPriority, type, recurrence, category, createdAt, updatedAt',
      config: 'id'
    });
  }
}

export const db = new NotesnookDatabase();

export async function initializeDatabaseWithSeed(): Promise<void> {
  const config = await db.config.get('app_config');
  if (config && config.isInitialized) {
    return;
  }

  // Seed sample notes showcasing Notesnook Block editor capabilities
  const sampleNote1Blocks = [
    {
      id: generateId(),
      type: 'text' as const,
      text: 'Welcome to RuN Desktop — Zero-Knowledge Notes & Focus Tracker',
      spans: [
        { type: 'HEADING_1' as const, start: 0, end: 63 }
      ]
    },
    {
      id: generateId(),
      type: 'callout' as const,
      calloutType: 'tip' as const,
      text: 'Your notes are secured with client-side Zero-Knowledge WebCrypto (AES-256-GCM + PBKDF2). Plaintext never leaves your browser!'
    },
    {
      id: generateId(),
      type: 'text' as const,
      text: 'This desktop application achieves 100% data compatibility with the Android app schema and includes rich block elements:',
      spans: []
    },
    {
      id: generateId(),
      type: 'table' as const,
      rows: 4,
      cols: 3,
      data: [
        ['Block Feature', 'Desktop Web Support', 'Android Keep / Block Engine'],
        ['Interactive Tables', '✅ Resizable & Matrix Selector', '✅ NotesnookTableWidget'],
        ['LaTeX Math Formulas', '✅ KaTeX Dynamic Rendering', '✅ Native MathJax View'],
        ['End-to-End Encryption', '✅ WebCrypto AES-256-GCM', '✅ Room SQLCipher / Vault']
      ]
    },
    {
      id: generateId(),
      type: 'horizontal_rule' as const
    },
    {
      id: generateId(),
      type: 'text' as const,
      text: 'Mathematics & Equations',
      spans: [{ type: 'HEADING_2' as const, start: 0, end: 23 }]
    },
    {
      id: generateId(),
      type: 'math' as const,
      formula: '\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
      isInline: false
    },
    {
      id: generateId(),
      type: 'text' as const,
      text: 'Code Snippets & Architecture',
      spans: [{ type: 'HEADING_2' as const, start: 0, end: 28 }]
    },
    {
      id: generateId(),
      type: 'code' as const,
      language: 'TypeScript',
      code: `// Zero-Knowledge WebCrypto Encrypt
const key = await VaultSecurity.deriveKey(passphrase, salt);
const payload = await VaultSecurity.encrypt(noteJson, key);
console.log("Encrypted securely with AES-256-GCM!");`
    },
    {
      id: generateId(),
      type: 'outline' as const,
      level: 0,
      text: 'Keyboard shortcut: Ctrl/Cmd + N to create note immediately',
      isNumbered: false
    },
    {
      id: generateId(),
      type: 'outline' as const,
      level: 0,
      text: 'Keyboard shortcut: Ctrl/Cmd + K for Universal Command Palette',
      isNumbered: false
    }
  ];

  const sampleNote1: NoteEntity = {
    id: 'note_intro_001',
    title: 'Getting Started with RuN & Notesnook',
    content: NotesnookBlockManager.serialize(sampleNote1Blocks),
    isChecklist: false,
    checklistJson: '[]',
    colorKey: 'theme_focus',
    fontKey: 'default',
    isPinned: true,
    isArchived: false,
    isTrashed: false,
    labelsJson: JSON.stringify(['Tutorial', 'Features', 'Zero-Knowledge']),
    imageUrisJson: '[]',
    audioUrisJson: '[]',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now()
  };

  const sampleNote2Checklist = [
    { id: 'chk_1', text: 'Set up Master Vault Password & Recovery phrase', isChecked: true },
    { id: 'chk_2', text: 'Test rich block insertion (Table, Math, Code, Callout)', isChecked: true },
    { id: 'chk_3', text: 'Create recurring daily focus tasks', isChecked: false },
    { id: 'chk_4', text: 'Export encrypted backup to local storage', isChecked: false }
  ];

  const sampleNote2: NoteEntity = {
    id: 'note_checklist_002',
    title: 'Productivity Launch Checklist',
    content: 'Review and verify your daily workspace preferences.',
    isChecklist: true,
    checklistJson: JSON.stringify(sampleNote2Checklist),
    colorKey: 'mint',
    fontKey: 'nunito',
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    labelsJson: JSON.stringify(['Work', 'Checklist']),
    imageUrisJson: '[]',
    audioUrisJson: '[]',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now()
  };

  // Seed sample tasks
  const sampleTasks: TaskEntity[] = [
    {
      id: 'task_001',
      title: 'Deep Focus: Complete Sprint Architecture Review',
      details: 'Analyze zero-knowledge security guarantees and data serialization benchmarks.',
      dueDate: Date.now() + 86400000,
      isCompleted: false,
      type: 'TASK',
      recurrence: 'DAILY',
      isPersistent: true,
      isPriority: true,
      completedAt: null,
      category: 'Engineering',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now()
    },
    {
      id: 'task_002',
      title: 'Team Sync & Milestone Demo',
      details: 'Demonstrate Notesnook block editor and resizable table widget.',
      dueDate: Date.now() + 172800000,
      isCompleted: false,
      type: 'TASK',
      recurrence: 'WEEKLY',
      isPersistent: false,
      isPriority: false,
      completedAt: null,
      category: 'Work',
      createdAt: Date.now() - 50000000,
      updatedAt: Date.now()
    },
    {
      id: 'task_003',
      title: 'Alex Project Anniversary',
      details: 'Celebrate 1 year of continuous offline-first development!',
      dueDate: Date.now() + 604800000,
      isCompleted: false,
      type: 'ANNIVERSARY',
      recurrence: 'YEARLY',
      isPersistent: false,
      isPriority: true,
      completedAt: null,
      category: 'Personal',
      createdAt: Date.now() - 10000000,
      updatedAt: Date.now()
    }
  ];

  await db.notes.bulkPut([sampleNote1, sampleNote2]);
  await db.tasks.bulkPut(sampleTasks);
  await db.config.put({
    id: 'app_config',
    isVaultConfigured: false,
    autoLockMinutes: 15,
    themeMode: 'dark',
    isInitialized: true
  });
}
