import React from 'react';
import { CalloutBlock, CalloutType } from '../types/notes';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Lightbulb, Pin, Trash2 } from 'lucide-react';

interface CalloutBlockEditorProps {
  block: CalloutBlock;
  onChange: (updated: CalloutBlock) => void;
  onDelete: () => void;
  isReadOnly?: boolean;
}

const CALLOUT_CONFIGS: Record<CalloutType, { label: string; icon: any; border: string; bg: string; text: string; badge: string }> = {
  note: {
    label: 'Note',
    icon: Lightbulb,
    border: 'border-blue-500/40',
    bg: 'bg-blue-950/20',
    text: 'text-blue-300',
    badge: 'bg-blue-500/20 text-blue-400'
  },
  tip: {
    label: 'Tip',
    icon: CheckCircle2,
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/20',
    text: 'text-emerald-300',
    badge: 'bg-emerald-500/20 text-emerald-400'
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    border: 'border-amber-500/40',
    bg: 'bg-amber-950/20',
    text: 'text-amber-300',
    badge: 'bg-amber-500/20 text-amber-400'
  },
  important: {
    label: 'Important',
    icon: Pin,
    border: 'border-purple-500/40',
    bg: 'bg-purple-950/20',
    text: 'text-purple-300',
    badge: 'bg-purple-500/20 text-purple-400'
  },
  info: {
    label: 'Info',
    icon: Info,
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-950/20',
    text: 'text-cyan-300',
    badge: 'bg-cyan-500/20 text-cyan-400'
  },
  success: {
    label: 'Success',
    icon: CheckCircle2,
    border: 'border-green-500/40',
    bg: 'bg-green-950/20',
    text: 'text-green-300',
    badge: 'bg-green-500/20 text-green-400'
  }
};

export const CalloutBlockEditor: React.FC<CalloutBlockEditorProps> = ({
  block,
  onChange,
  onDelete,
  isReadOnly = false
}) => {
  const config = CALLOUT_CONFIGS[block.calloutType] || CALLOUT_CONFIGS.note;
  const IconComponent = config.icon;

  return (
    <div
      id={`callout-block-${block.id}`}
      className={`group relative my-3 rounded-xl border-l-4 ${config.border} ${config.bg} border-y border-r border-[#262B35] p-3.5 transition-all`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-4 w-4 ${config.text}`} />
          {isReadOnly ? (
            <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${config.badge}`}>
              {config.label}
            </span>
          ) : (
            <div className="flex items-center gap-1">
              {(Object.keys(CALLOUT_CONFIGS) as CalloutType[]).map(type => {
                const isSelected = block.calloutType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChange({ ...block, calloutType: type })}
                    className={`rounded-md px-2 py-0.5 text-xs capitalize transition ${
                      isSelected
                        ? `${CALLOUT_CONFIGS[type].badge} font-semibold ring-1 ring-white/20`
                        : 'text-[#9CA3AF] hover:bg-[#1E232D] hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {!isReadOnly && (
          <button
            onClick={onDelete}
            className="rounded p-1 text-[#9CA3AF] hover:bg-red-500/20 hover:text-red-400"
            title="Delete Callout"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isReadOnly ? (
        <div className="text-sm leading-relaxed text-[#F9FAFB] whitespace-pre-wrap">
          {block.text}
        </div>
      ) : (
        <textarea
          value={block.text}
          onChange={e => onChange({ ...block, text: e.target.value })}
          placeholder="Callout note or key insight..."
          rows={2}
          className="w-full resize-y rounded bg-transparent text-sm leading-relaxed text-[#F9FAFB] placeholder-[#6B7280] outline-none"
        />
      )}
    </div>
  );
};
