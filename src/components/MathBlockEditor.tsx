import React, { useState, useEffect, useRef } from 'react';
import { MathFormulaBlock } from '../types/notes';
import katex from 'katex';
import { Trash2, Sigma, Copy, Check, Sparkles } from 'lucide-react';

interface MathBlockEditorProps {
  block: MathFormulaBlock;
  onChange: (updated: MathFormulaBlock) => void;
  onDelete: () => void;
  isReadOnly?: boolean;
}

const FORMULA_PRESETS = [
  { label: 'Fraction', formula: '\\frac{a}{b}' },
  { label: 'Square Root', formula: '\\sqrt{x^2 + y^2}' },
  { label: 'Integral', formula: '\\int_{a}^{b} f(x) \\, dx' },
  { label: 'Summation', formula: '\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}' },
  { label: 'Matrix', formula: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: 'Euler', formula: 'e^{i\\pi} + 1 = 0' },
  { label: 'Quadratic', formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' }
];

export const MathBlockEditor: React.FC<MathBlockEditorProps> = ({
  block,
  onChange,
  onDelete,
  isReadOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formulaText, setFormulaText] = useState(block.formula || 'E = mc^2');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFormulaText(block.formula || 'E = mc^2');
  }, [block.formula]);

  useEffect(() => {
    if (previewRef.current) {
      try {
        katex.render(formulaText, previewRef.current, {
          displayMode: true,
          throwOnError: false
        });
        setErrorMsg(null);
      } catch (err: any) {
        setErrorMsg(err.message || 'LaTeX parsing error');
      }
    }
  }, [formulaText]);

  const handleSave = () => {
    onChange({
      ...block,
      formula: formulaText
    });
    setIsEditing(false);
  };

  const copyLatex = () => {
    navigator.clipboard.writeText(formulaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id={`math-block-${block.id}`} className="group relative my-3 rounded-xl border border-[#262B35] bg-[#161920] p-4 transition-all hover:border-[#333A48]">
      <div className="mb-2 flex items-center justify-between border-b border-[#262B35] pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded bg-[#1E232D] px-2 py-0.5 text-xs font-semibold text-[#22C55E]">
            <Sigma className="h-3.5 w-3.5" />
            LaTeX Math
          </div>
          <span className="text-[11px] text-[#6B7280]">KaTeX Rendering</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={copyLatex}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-[#9CA3AF] hover:bg-[#262B35] hover:text-white"
            title="Copy LaTeX Source"
          >
            {copied ? <Check className="h-3 w-3 text-[#22C55E]" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {!isReadOnly && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded px-2 py-0.5 text-xs text-[#9CA3AF] hover:bg-[#262B35] hover:text-white"
              >
                {isEditing ? 'Done' : 'Edit LaTeX'}
              </button>
              <button
                onClick={onDelete}
                className="rounded p-1 text-[#9CA3AF] hover:bg-red-500/20 hover:text-red-400"
                title="Delete Math Block"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rendered Math Formula */}
      <div
        onClick={() => !isReadOnly && setIsEditing(true)}
        className="my-3 flex cursor-pointer items-center justify-center overflow-x-auto rounded-lg bg-[#0F1115] p-4 transition-colors hover:bg-[#12151B]"
      >
        <div ref={previewRef} className="text-[#F9FAFB]" />
      </div>

      {errorMsg && (
        <div className="mb-2 text-xs text-amber-400">{errorMsg}</div>
      )}

      {/* LaTeX formula input and quick presets */}
      {isEditing && !isReadOnly && (
        <div className="mt-3 rounded-lg border border-[#262B35] bg-[#1E232D] p-3">
          <label className="mb-1 block text-xs font-medium text-[#9CA3AF]">
            LaTeX Equation:
          </label>
          <input
            type="text"
            value={formulaText}
            onChange={e => setFormulaText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave();
            }}
            placeholder="e.g. \int_0^1 x^2 dx"
            className="w-full rounded-lg border border-[#333A48] bg-[#0F1115] px-3 py-2 font-mono text-sm text-[#F9FAFB] outline-none focus:border-[#22C55E]"
            autoFocus
          />

          {/* Quick presets */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
              <Sparkles className="h-3 w-3 text-[#22C55E]" /> Presets:
            </span>
            {FORMULA_PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => setFormulaText(p.formula)}
                className="rounded-md border border-[#333A48] bg-[#161920] px-2 py-0.5 text-[11px] text-[#D1D5DB] transition hover:border-[#22C55E] hover:text-[#22C55E]"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-md px-3 py-1 text-xs text-[#9CA3AF] hover:bg-[#262B35]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-[#22C55E] px-3 py-1 text-xs font-semibold text-[#0F1115] transition hover:bg-[#16A34A]"
            >
              Save Formula
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
