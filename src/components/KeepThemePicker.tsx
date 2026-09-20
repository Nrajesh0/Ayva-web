import React from 'react';
import { KEEP_THEMES, FONT_OPTIONS, KeepTheme } from '../utils/keepThemes';
import { Palette, Type, Check } from 'lucide-react';

interface KeepThemePickerProps {
  selectedThemeKey: string;
  selectedFontKey: string;
  onSelectTheme: (key: string) => void;
  onSelectFont: (key: string) => void;
  onClose?: () => void;
}

export const KeepThemePicker: React.FC<KeepThemePickerProps> = ({
  selectedThemeKey,
  selectedFontKey,
  onSelectTheme,
  onSelectFont,
  onClose
}) => {
  const solidThemes = KEEP_THEMES.filter(t => !t.isIllustrated);
  const illustratedThemes = KEEP_THEMES.filter(t => t.isIllustrated);

  return (
    <div className="w-80 rounded-2xl border border-[#262B35] bg-[#161920] p-4 shadow-2xl">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between border-b border-[#262B35] pb-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
          <Palette className="h-4 w-4 text-[#22C55E]" />
          Theme & Background
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-[#9CA3AF] hover:text-white"
          >
            Done
          </button>
        )}
      </div>

      {/* Solid Pastel Colors */}
      <div className="mb-4">
        <div className="mb-2 text-[11px] font-medium text-[#6B7280]">Color Palette</div>
        <div className="grid grid-cols-6 gap-2">
          {solidThemes.map(theme => {
            const isSelected = (selectedThemeKey || 'default').toLowerCase() === theme.key.toLowerCase();
            return (
              <button
                key={theme.key}
                type="button"
                onClick={() => onSelectTheme(theme.key)}
                className="group relative flex h-9 w-9 items-center justify-center rounded-full border transition hover:scale-110"
                style={{
                  backgroundColor: theme.darkBg,
                  borderColor: isSelected ? '#22C55E' : theme.darkBorder
                }}
                title={theme.name}
              >
                {isSelected && <Check className="h-4 w-4 text-white drop-shadow" />}
                <span className="sr-only">{theme.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Illustrated Themes */}
      <div className="mb-4">
        <div className="mb-2 text-[11px] font-medium text-[#6B7280]">Illustrated Themes</div>
        <div className="grid grid-cols-3 gap-2">
          {illustratedThemes.map(theme => {
            const isSelected = (selectedThemeKey || '').toLowerCase() === theme.key.toLowerCase();
            return (
              <button
                key={theme.key}
                type="button"
                onClick={() => onSelectTheme(theme.key)}
                className={`relative flex items-center gap-1.5 rounded-xl border p-2 text-left transition hover:scale-105 ${
                  isSelected
                    ? 'border-[#22C55E] bg-[#22C55E]/10'
                    : 'border-[#262B35] bg-[#1E232D] hover:border-[#333A48]'
                }`}
                style={{
                  backgroundColor: isSelected ? undefined : theme.darkBg
                }}
              >
                <span className="text-base">{theme.emoji}</span>
                <span className="truncate text-xs font-medium text-[#F9FAFB]">
                  {theme.name}
                </span>
                {isSelected && (
                  <Check className="absolute right-1.5 top-1.5 h-3 w-3 text-[#22C55E]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Family Selector */}
      <div className="border-t border-[#262B35] pt-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280]">
          <Type className="h-3.5 w-3.5" />
          Typography Style
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {FONT_OPTIONS.map(font => {
            const isSelected = (selectedFontKey || 'default').toLowerCase() === font.key.toLowerCase();
            return (
              <button
                key={font.key}
                type="button"
                onClick={() => onSelectFont(font.key)}
                className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                  isSelected
                    ? 'border-[#22C55E] bg-[#22C55E]/10 font-semibold text-[#22C55E]'
                    : 'border-[#262B35] bg-[#161920] text-[#D1D5DB] hover:border-[#333A48] hover:text-white'
                }`}
                style={{ fontFamily: font.fontFamily }}
              >
                {font.name.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
