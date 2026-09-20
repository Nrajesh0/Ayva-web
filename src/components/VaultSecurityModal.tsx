import React, { useState } from 'react';
import { VaultSecurity, generateMnemonicPhrase, VaultExportPackage } from '../crypto/vaultSecurity';
import { db, VaultConfig } from '../db/database';
import { NoteEntity } from '../types/notes';
import { TaskEntity } from '../types/tasks';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  KeyRound,
  Download,
  Upload,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  FileCheck,
  X,
  Sparkles
} from 'lucide-react';

interface VaultSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlockVault: (passphrase: string) => Promise<boolean>;
  onLockVault: () => void;
  notes: NoteEntity[];
  tasks: TaskEntity[];
  onImportVaultData: (data: { notes: NoteEntity[]; tasks: TaskEntity[] }) => void;
}

export const VaultSecurityModal: React.FC<VaultSecurityModalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  onUnlockVault,
  onLockVault,
  notes,
  tasks,
  onImportVaultData
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'status' | 'backup' | 'recovery' | 'audit'>('status');
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState(generateMnemonicPhrase(12));
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [importPassphrase, setImportPassphrase] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUnlockOrSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase) return;

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const success = await onUnlockVault(passphrase);
      if (success) {
        setStatusMessage({ text: 'Vault unlocked successfully with AES-256-GCM session key!', type: 'success' });
      } else {
        setStatusMessage({ text: 'Incorrect vault passphrase. Please verify and try again.', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Unlock error', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportVault = async () => {
    if (!exportPassphrase) {
      setStatusMessage({ text: 'Please enter a passphrase to encrypt your backup vault.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const vaultData = {
        notes,
        tasks,
        exportedAt: Date.now()
      };

      const pkg = await VaultSecurity.exportEncryptedVault(vaultData, exportPassphrase);
      const jsonContent = JSON.stringify(pkg, null, 2);

      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `run_notesnook_vault_${new Date().toISOString().slice(0, 10)}.vault.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({ text: 'Encrypted Zero-Knowledge Vault Package downloaded!', type: 'success' });
      setExportPassphrase('');
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Export error', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportVault = async () => {
    if (!importJsonText.trim()) {
      setStatusMessage({ text: 'Please paste the encrypted vault package JSON.', type: 'error' });
      return;
    }
    if (!importPassphrase) {
      setStatusMessage({ text: 'Please enter the passphrase used to encrypt this backup.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const pkg: VaultExportPackage = JSON.parse(importJsonText);
      const decrypted = await VaultSecurity.importEncryptedVault(pkg, importPassphrase);

      if (decrypted && Array.isArray(decrypted.notes)) {
        onImportVaultData({
          notes: decrypted.notes,
          tasks: decrypted.tasks || []
        });
        setStatusMessage({
          text: `Vault imported! Restored ${decrypted.notes.length} notes and ${decrypted.tasks?.length || 0} tasks.`,
          type: 'success'
        });
        setImportJsonText('');
        setImportPassphrase('');
      } else {
        throw new Error('Invalid vault package format.');
      }
    } catch (err: any) {
      setStatusMessage({ text: `Import failed: ${err.message}`, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyMnemonic = () => {
    navigator.clipboard.writeText(recoveryPhrase);
    setCopiedMnemonic(true);
    setTimeout(() => setCopiedMnemonic(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#262B35] bg-[#161920] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262B35] bg-[#12151B] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10">
              <ShieldCheck className="h-5 w-5 text-[#22C55E]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F9FAFB]">
                Zero-Knowledge Vault & Security
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                End-to-End Encryption powered by WebCrypto API (AES-256-GCM)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-[#1E232D] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#262B35] bg-[#0F1115] px-6">
          <button
            onClick={() => {
              setActiveTab('status');
              setStatusMessage(null);
            }}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === 'status'
                ? 'border-[#22C55E] text-[#22C55E]'
                : 'border-transparent text-[#9CA3AF] hover:text-white'
            }`}
          >
            Vault Lock / Unlock
          </button>
          <button
            onClick={() => {
              setActiveTab('backup');
              setStatusMessage(null);
            }}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === 'backup'
                ? 'border-[#22C55E] text-[#22C55E]'
                : 'border-transparent text-[#9CA3AF] hover:text-white'
            }`}
          >
            Encrypted Backup & Import
          </button>
          <button
            onClick={() => {
              setActiveTab('recovery');
              setStatusMessage(null);
            }}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === 'recovery'
                ? 'border-[#22C55E] text-[#22C55E]'
                : 'border-transparent text-[#9CA3AF] hover:text-white'
            }`}
          >
            Emergency 12-Word Phrase
          </button>
          <button
            onClick={() => {
              setActiveTab('audit');
              setStatusMessage(null);
            }}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === 'audit'
                ? 'border-[#22C55E] text-[#22C55E]'
                : 'border-transparent text-[#9CA3AF] hover:text-white'
            }`}
          >
            Security Architecture
          </button>
        </div>

        {/* Status alert banner */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 flex items-center gap-2 rounded-xl p-3 text-xs ${
              statusMessage.type === 'success'
                ? 'border border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]'
                : 'border border-red-500/40 bg-red-500/10 text-red-400'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab 1: Status & Unlock / Lock */}
        {activeTab === 'status' && (
          <div className="p-6">
            <div className="flex items-center justify-between rounded-xl border border-[#262B35] bg-[#12151B] p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isUnlocked
                      ? 'bg-[#22C55E]/20 text-[#22C55E]'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {isUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#F9FAFB]">
                    Current Session: {isUnlocked ? 'Vault Unlocked' : 'Vault Locked'}
                  </div>
                  <div className="text-xs text-[#9CA3AF]">
                    {isUnlocked
                      ? 'Crypto keys are active in memory. Auto-lock triggers on inactivity.'
                      : 'Master keys are cleared from browser memory.'}
                  </div>
                </div>
              </div>

              {isUnlocked && (
                <button
                  onClick={onLockVault}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Lock Now
                </button>
              )}
            </div>

            {!isUnlocked && (
              <form onSubmit={handleUnlockOrSet} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#9CA3AF]">
                    Master Vault Passphrase:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passphrase}
                      onChange={e => setPassphrase(e.target.value)}
                      placeholder="Enter master password..."
                      className="w-full rounded-xl border border-[#262B35] bg-[#0F1115] px-4 py-2.5 text-sm text-[#F9FAFB] outline-none focus:border-[#22C55E]"
                      autoFocus
                    />
                    <Key className="absolute right-3.5 top-3 h-4 w-4 text-[#6B7280]" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !passphrase}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] py-2.5 text-sm font-bold text-[#0F1115] transition hover:bg-[#16A34A] disabled:opacity-40"
                >
                  <Unlock className="h-4 w-4" />
                  {isProcessing ? 'Deriving Keys (100k PBKDF2)...' : 'Unlock Vault Session'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-6 p-6">
            {/* Export */}
            <div className="rounded-xl border border-[#262B35] bg-[#12151B] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#F9FAFB]">
                <Download className="h-4 w-4 text-[#22C55E]" />
                Export Encrypted Vault Backup
              </h3>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Exports all {notes.length} notes and {tasks.length} tasks into an AES-256-GCM encrypted JSON package.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="password"
                  value={exportPassphrase}
                  onChange={e => setExportPassphrase(e.target.value)}
                  placeholder="Set backup passphrase..."
                  className="flex-1 rounded-lg border border-[#262B35] bg-[#0F1115] px-3 py-2 text-xs text-[#F9FAFB] outline-none focus:border-[#22C55E]"
                />
                <button
                  onClick={handleExportVault}
                  disabled={isProcessing || !exportPassphrase}
                  className="rounded-lg bg-[#22C55E] px-4 py-2 text-xs font-bold text-[#0F1115] transition hover:bg-[#16A34A] disabled:opacity-40"
                >
                  Export .vault.json
                </button>
              </div>
            </div>

            {/* Import */}
            <div className="rounded-xl border border-[#262B35] bg-[#12151B] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#F9FAFB]">
                <Upload className="h-4 w-4 text-blue-400" />
                Import & Decrypt Vault Package
              </h3>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Paste the contents of a `.vault.json` file to restore your notes and tasks.
              </p>

              <textarea
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                placeholder='Paste {"metadata": {...}, "payload": {...}} JSON here...'
                rows={3}
                className="mt-3 w-full rounded-lg border border-[#262B35] bg-[#0F1115] p-2.5 font-mono text-xs text-[#F9FAFB] placeholder-[#4B5563] outline-none focus:border-[#22C55E]"
              />

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="password"
                  value={importPassphrase}
                  onChange={e => setImportPassphrase(e.target.value)}
                  placeholder="Enter decrypt passphrase..."
                  className="flex-1 rounded-lg border border-[#262B35] bg-[#0F1115] px-3 py-2 text-xs text-[#F9FAFB] outline-none focus:border-[#22C55E]"
                />
                <button
                  onClick={handleImportVault}
                  disabled={isProcessing || !importJsonText || !importPassphrase}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 disabled:opacity-40"
                >
                  Restore Vault
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Emergency Mnemonic Recovery Phrase */}
        {activeTab === 'recovery' && (
          <div className="p-6">
            <div className="rounded-xl border border-[#262B35] bg-[#12151B] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#F9FAFB]">
                  <KeyRound className="h-4 w-4 text-[#22C55E]" />
                  12-Word Emergency Recovery Phrase
                </div>
                <button
                  onClick={() => setRecoveryPhrase(generateMnemonicPhrase(12))}
                  className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#22C55E]"
                >
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </button>
              </div>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Write down these 12 BIP-39 recovery words in a safe place. In zero-knowledge architecture, no server or admin can ever recover your password if lost.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {recoveryPhrase.split(' ').map((word, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg border border-[#262B35] bg-[#0F1115] px-3 py-2 text-xs font-mono text-[#F9FAFB]"
                  >
                    <span className="text-[#6B7280]">{idx + 1}.</span>
                    <span className="font-semibold text-[#22C55E]">{word}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={copyMnemonic}
                  className="flex items-center gap-1.5 rounded-lg border border-[#262B35] bg-[#161920] px-3 py-1.5 text-xs font-medium text-[#F9FAFB] transition hover:border-[#22C55E]"
                >
                  {copiedMnemonic ? (
                    <Check className="h-3.5 w-3.5 text-[#22C55E]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedMnemonic ? 'Copied Mnemonic' : 'Copy All 12 Words'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Security Architecture Audit */}
        {activeTab === 'audit' && (
          <div className="space-y-3 p-6 text-xs text-[#9CA3AF]">
            <div className="rounded-xl border border-[#262B35] bg-[#12151B] p-4">
              <h3 className="mb-2 text-sm font-semibold text-[#F9FAFB]">
                Zero-Knowledge Specification
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
                  <span>
                    <strong className="text-white">Ciphersuite:</strong> AES-256-GCM with 96-bit unique cryptographically secure pseudo-random initialization vectors (IV) generated per block/note.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
                  <span>
                    <strong className="text-white">Key Derivation:</strong> PBKDF2 with SHA-256 and 100,000 iterations + 128-bit random salt.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
                  <span>
                    <strong className="text-white">Local-First Storage:</strong> High-performance IndexedDB via Dexie.js for offline persistence with zero unencrypted remote server telemetry.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
                  <span>
                    <strong className="text-white">Android Compatibility:</strong> Serialization parser mirrors `NotesnookBlockModel.kt` and Room `NoteEntity` schemas.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#262B35] bg-[#12151B] px-6 py-3">
          <span className="text-[11px] text-[#6B7280]">
            Version 1.0.0 · RuN & Notesnook Engine
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#1E232D] px-4 py-1.5 text-xs font-semibold text-[#F9FAFB] transition hover:bg-[#262B35]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
