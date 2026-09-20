import React, { useState } from 'react';
import { CodeBlock } from '../types/notes';
import { Trash2, Copy, Check, Code } from 'lucide-react';

interface CodeBlockEditorProps {
  block: CodeBlock;
  onChange: (updated: CodeBlock) => void;
  onDelete: () => void;
  isReadOnly?: boolean;
}

const LANGUAGES = [
  'Kotlin',
  'TypeScript',
  'JavaScript',
  'Python',
  'Rust',
  'Go',
  'SQL',
  'JSON',
  'HTML',
  'CSS',
  'Bash',
  'Java',
  'C++',
  'Markdown'
];

export const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({
  block,
  onChange,
  onDelete,
  isReadOnly = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = (block.code || '').split('\n').length || 1;

  return (
    <div id={`code-block-${block.id}`} className="group relative my-3 overflow-hidden rounded-xl border border-[#262B35] bg-[#12151B] transition-all hover:border-[#333A48]">
      {/* Code Header Toolbar */}
      <div className="flex items-center justify-between border-b border-[#262B35] bg-[#161920] px-3.5 py-2">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-[#22C55E]" />
          {isReadOnly ? (
            <span className="text-xs font-semibold text-[#F9FAFB]">{block.language}</span>
          ) : (
            <select
              value={block.language || 'Kotlin'}
              onChange={e => onChange({ ...block, language: e.target.value })}
              className="rounded bg-[#1E232D] px-2 py-0.5 text-xs font-medium text-[#F9FAFB] outline-none hover:bg-[#262B35] focus:ring-1 focus:ring-[#22C55E]"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#9CA3AF] transition hover:bg-[#262B35] hover:text-white"
            title="Copy Code"
          >
            {copied ? <Check className="h-3 w-3 text-[#22C55E]" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {!isReadOnly && (
            <button
              onClick={onDelete}
              className="rounded p-1 text-[#9CA3AF] transition hover:bg-red-500/20 hover:text-red-400"
              title="Delete Code Block"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="flex bg-[#0D0F14] font-mono text-sm leading-relaxed">
        {/* Line Numbers Column */}
        <div className="select-none border-r border-[#222733] bg-[#101319] py-3.5 pl-3 pr-2 text-right text-xs text-[#4B5563]">
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <div className="w-full p-3.5">
          {isReadOnly ? (
            <pre className="overflow-x-auto text-[#E5E7EB] leading-6 font-mono whitespace-pre">
              {block.code}
            </pre>
          ) : (
            <textarea
              value={block.code}
              onChange={e => onChange({ ...block, code: e.target.value })}
              placeholder="// Enter code snippet..."
              rows={Math.max(2, Math.min(25, lineCount))}
              className="w-full resize-y bg-transparent font-mono text-sm leading-6 text-[#E5E7EB] placeholder-[#4B5563] outline-none"
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};
