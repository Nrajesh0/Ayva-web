export type RichSpanType =
  | 'BOLD'
  | 'ITALIC'
  | 'UNDERLINE'
  | 'STRIKETHROUGH'
  | 'HIGHLIGHT'
  | 'CODE'
  | 'SUBSCRIPT'
  | 'SUPERSCRIPT'
  | 'HEADING_1'
  | 'HEADING_2'
  | 'HEADING_3'
  | 'HEADING_4'
  | 'HEADING_5'
  | 'HEADING_6'
  | 'LINK'
  | 'QUOTE'
  | 'TEXT_COLOR';

export interface RichSpan {
  type: RichSpanType;
  start: number;
  end: number;
  payload?: string | null;
}

export type BlockType =
  | 'text'
  | 'table'
  | 'horizontal_rule'
  | 'code'
  | 'math'
  | 'callout'
  | 'quote'
  | 'outline'
  | 'embed'
  | 'attachment'
  | 'image';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  text: string;
  spans: RichSpan[];
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  rows: number;
  cols: number;
  data: string[][];
  columnWidths?: number[]; // Custom pixel width or percentage for drag-resizing columns
}

export interface HorizontalRuleBlock extends BaseBlock {
  type: 'horizontal_rule';
}

export interface CodeBlock extends BaseBlock {
  type: 'code';
  language: string;
  code: string;
}

export interface MathFormulaBlock extends BaseBlock {
  type: 'math';
  formula: string;
  isInline?: boolean;
}

export type CalloutType = 'note' | 'warning' | 'important' | 'tip' | 'info' | 'success';

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  calloutType: CalloutType;
  text: string;
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  text: string;
}

export interface OutlineItemBlock extends BaseBlock {
  type: 'outline';
  level: number;
  text: string;
  isCollapsed?: boolean;
  isNumbered?: boolean;
}

export type EmbedType = 'YouTube' | 'Audio' | 'Web Link' | 'Figma' | 'CodePen';

export interface EmbedBlock extends BaseBlock {
  type: 'embed';
  embedType: EmbedType;
  url: string;
  title: string;
}

export interface AttachmentBlock extends BaseBlock {
  type: 'attachment';
  uri: string;
  fileName: string;
  fileSize: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  uri: string;
  caption: string;
}

export type NotesnookBlock =
  | TextBlock
  | TableBlock
  | HorizontalRuleBlock
  | CodeBlock
  | MathFormulaBlock
  | CalloutBlock
  | QuoteBlock
  | OutlineItemBlock
  | EmbedBlock
  | AttachmentBlock
  | ImageBlock;

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface NoteEntity {
  id: number | string;
  title: string;
  content: string;
  isChecklist: boolean;
  checklistJson: string; // JSON array of ChecklistItem
  colorKey: string; // 'default', 'coral', 'mint', 'theme_food', etc.
  fontKey: string; // 'default', 'caveat', 'nunito', 'roboto_mono', 'roboto_serif', 'roboto_slab'
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  labelsJson: string; // JSON array of string tags
  imageUrisJson: string; // JSON array of string image URLs
  audioUrisJson: string; // JSON array of string audio URLs
  createdAt: number;
  updatedAt: number;
  // Zero-Knowledge sync & encrypted payload field support
  isEncrypted?: boolean;
  encryptedBlob?: string;
  syncRevision?: number;
}
