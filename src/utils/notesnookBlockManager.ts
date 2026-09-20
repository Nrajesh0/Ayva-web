import {
  NotesnookBlock,
  RichSpan,
  RichSpanType,
  TextBlock,
  TableBlock,
  CodeBlock,
  MathFormulaBlock,
  CalloutBlock,
  CalloutType,
  QuoteBlock,
  OutlineItemBlock,
  EmbedBlock,
  AttachmentBlock,
  ImageBlock,
  HorizontalRuleBlock
} from '../types/notes';

export const BLOCKS_PREFIX = '<!--NOTESNOOK_BLOCKS:';
export const BLOCKS_SUFFIX = ':BLOCKS_END-->';
const TABLE_START = '<!--TABLE_START:';
const TABLE_END = ':TABLE_END-->';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'blk_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export class NotesnookBlockManager {
  /**
   * Serializes a list of NotesnookBlocks into a persistent string format.
   */
  static serialize(blocks: NotesnookBlock[]): string {
    if (!blocks || blocks.length === 0) return '';

    // If single text block with no spans, keep plain text for backward compatibility
    if (blocks.length === 1 && blocks[0].type === 'text') {
      const textBlock = blocks[0] as TextBlock;
      if (!textBlock.spans || textBlock.spans.length === 0) {
        return textBlock.text || '';
      }
    }

    try {
      const root = {
        version: 1,
        blocks: blocks.map(block => {
          const base: Record<string, any> = {
            id: block.id || generateId(),
            type: block.type
          };

          switch (block.type) {
            case 'text':
              base.text = block.text;
              base.spans = (block.spans || []).map(s => ({
                type: s.type,
                start: s.start,
                end: s.end,
                payload: s.payload ?? null
              }));
              break;
            case 'table':
              base.rows = block.rows;
              base.cols = block.cols;
              base.data = block.data;
              if (block.columnWidths) {
                base.columnWidths = block.columnWidths;
              }
              break;
            case 'horizontal_rule':
              break;
            case 'code':
              base.language = block.language || 'Kotlin';
              base.code = block.code || '';
              break;
            case 'math':
              base.formula = block.formula || 'E = mc²';
              base.isInline = !!block.isInline;
              break;
            case 'callout':
              base.calloutType = block.calloutType || 'note';
              base.text = block.text || '';
              break;
            case 'quote':
              base.text = block.text || '';
              break;
            case 'outline':
              base.level = block.level ?? 0;
              base.text = block.text || '';
              base.isCollapsed = !!block.isCollapsed;
              base.isNumbered = block.isNumbered !== false;
              break;
            case 'embed':
              base.embedType = block.embedType || 'YouTube';
              base.url = block.url || '';
              base.title = block.title || '';
              break;
            case 'attachment':
              base.uri = block.uri || '';
              base.fileName = block.fileName || 'attachment.pdf';
              base.fileSize = block.fileSize || '1.2 MB';
              break;
            case 'image':
              base.uri = block.uri || '';
              base.caption = block.caption || '';
              break;
          }

          return base;
        })
      };

      return `${BLOCKS_PREFIX}${JSON.stringify(root)}${BLOCKS_SUFFIX}`;
    } catch {
      return this.toPlainText(blocks);
    }
  }

  /**
   * Parses stored content string into a list of NotesnookBlocks.
   * Seamlessly handles blocks JSON, legacy table tags, and Markdown.
   */
  static parse(raw: string): NotesnookBlock[] {
    if (!raw || typeof raw !== 'string' || !raw.trim()) {
      return [{ id: generateId(), type: 'text', text: '', spans: [] }];
    }

    // 1. Check for native Notesnook Blocks JSON
    if (raw.includes(BLOCKS_PREFIX) && raw.includes(BLOCKS_SUFFIX)) {
      try {
        const start = raw.indexOf(BLOCKS_PREFIX) + BLOCKS_PREFIX.length;
        const end = raw.indexOf(BLOCKS_SUFFIX, start);
        if (start >= 0 && end > start) {
          const jsonStr = raw.substring(start, end);
          const root = JSON.parse(jsonStr);
          if (root && Array.isArray(root.blocks) && root.blocks.length > 0) {
            const blocks: NotesnookBlock[] = [];
            for (const obj of root.blocks) {
              const id = obj.id || generateId();
              switch (obj.type) {
                case 'text':
                  blocks.push({
                    id,
                    type: 'text',
                    text: obj.text || '',
                    spans: Array.isArray(obj.spans)
                      ? obj.spans.map((s: any) => ({
                          type: s.type as RichSpanType,
                          start: s.start || 0,
                          end: s.end || 0,
                          payload: s.payload ?? null
                        }))
                      : []
                  });
                  break;
                case 'table':
                  blocks.push({
                    id,
                    type: 'table',
                    rows: obj.rows || (Array.isArray(obj.data) ? obj.data.length : 2),
                    cols: obj.cols || (Array.isArray(obj.data) && obj.data[0] ? obj.data[0].length : 2),
                    data: Array.isArray(obj.data) ? obj.data : [['', ''], ['', '']],
                    columnWidths: obj.columnWidths
                  });
                  break;
                case 'horizontal_rule':
                  blocks.push({ id, type: 'horizontal_rule' });
                  break;
                case 'code':
                  blocks.push({
                    id,
                    type: 'code',
                    language: obj.language || 'Kotlin',
                    code: obj.code || ''
                  });
                  break;
                case 'math':
                  blocks.push({
                    id,
                    type: 'math',
                    formula: obj.formula || 'E = mc²',
                    isInline: !!obj.isInline
                  });
                  break;
                case 'callout':
                  blocks.push({
                    id,
                    type: 'callout',
                    calloutType: obj.calloutType || 'note',
                    text: obj.text || ''
                  });
                  break;
                case 'quote':
                  blocks.push({
                    id,
                    type: 'quote',
                    text: obj.text || ''
                  });
                  break;
                case 'outline':
                  blocks.push({
                    id,
                    type: 'outline',
                    level: obj.level || 0,
                    text: obj.text || '',
                    isCollapsed: !!obj.isCollapsed,
                    isNumbered: obj.isNumbered !== false
                  });
                  break;
                case 'embed':
                  blocks.push({
                    id,
                    type: 'embed',
                    embedType: obj.embedType || 'YouTube',
                    url: obj.url || '',
                    title: obj.title || ''
                  });
                  break;
                case 'attachment':
                  blocks.push({
                    id,
                    type: 'attachment',
                    uri: obj.uri || '',
                    fileName: obj.fileName || 'attachment.pdf',
                    fileSize: obj.fileSize || '1.2 MB'
                  });
                  break;
                case 'image':
                  blocks.push({
                    id,
                    type: 'image',
                    uri: obj.uri || '',
                    caption: obj.caption || ''
                  });
                  break;
              }
            }
            if (blocks.length > 0) return blocks;
          }
        }
      } catch (err) {
        console.warn('Failed to parse notesnook JSON block:', err);
      }
    }

    // 2. Check for legacy table tags
    if (raw.includes(TABLE_START) && raw.includes(TABLE_END)) {
      const blocks: NotesnookBlock[] = [];
      let curIdx = 0;
      while (curIdx < raw.length) {
        const start = raw.indexOf(TABLE_START, curIdx);
        if (start === -1) {
          const remaining = raw.substring(curIdx);
          if (remaining.trim()) {
            blocks.push({ id: generateId(), type: 'text', text: remaining, spans: [] });
          }
          break;
        }
        if (start > curIdx) {
          const textBefore = raw.substring(curIdx, start);
          if (textBefore.trim()) {
            blocks.push({ id: generateId(), type: 'text', text: textBefore, spans: [] });
          }
        }
        const end = raw.indexOf(TABLE_END, start);
        if (end !== -1) {
          try {
            const jsonStr = raw.substring(start + TABLE_START.length, end);
            const jsonObj = JSON.parse(jsonStr);
            blocks.push({
              id: jsonObj.id || generateId(),
              type: 'table',
              rows: jsonObj.rows || 2,
              cols: jsonObj.cols || 2,
              data: jsonObj.data || [['', ''], ['', '']]
            });
          } catch {}
          curIdx = end + TABLE_END.length;
        } else {
          curIdx = start + TABLE_START.length;
        }
      }
      if (blocks.length > 0) return blocks;
    }

    // 3. Fallback: Parse markdown or multi-paragraph plain text into blocks
    return this.parseMarkdownToBlocks(raw);
  }

  /**
   * Converts markdown or standard plain text into intelligent block representations.
   */
  static parseMarkdownToBlocks(raw: string): NotesnookBlock[] {
    const blocks: NotesnookBlock[] = [];
    const lines = raw.split('\n');
    let currentTextBlock: TextBlock | null = null;

    let inCodeBlock = false;
    let codeLanguage = 'Kotlin';
    let codeLines: string[] = [];

    const flushText = () => {
      if (currentTextBlock && currentTextBlock.text) {
        blocks.push(currentTextBlock);
      }
      currentTextBlock = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Code Block fence
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          blocks.push({
            id: generateId(),
            type: 'code',
            language: codeLanguage,
            code: codeLines.join('\n')
          });
          inCodeBlock = false;
          codeLines = [];
        } else {
          flushText();
          inCodeBlock = true;
          codeLanguage = trimmed.replace('```', '').trim() || 'TypeScript';
          codeLines = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___' || trimmed.startsWith('──────')) {
        flushText();
        blocks.push({ id: generateId(), type: 'horizontal_rule' });
        continue;
      }

      // Callout (> [!NOTE] or > [!WARNING])
      if (trimmed.startsWith('> [!')) {
        flushText();
        const tagMatch = trimmed.match(/>\s*\[!([a-zA-Z]+)\]/);
        const calloutType = (tagMatch ? tagMatch[1].toLowerCase() : 'note') as CalloutType;
        const calloutLines: string[] = [];
        let j = i + 1;
        while (j < lines.length && lines[j].trim().startsWith('>')) {
          calloutLines.push(lines[j].trim().replace(/^>\s*/, ''));
          j++;
        }
        i = j - 1;
        blocks.push({
          id: generateId(),
          type: 'callout',
          calloutType: ['note', 'warning', 'important', 'tip', 'info', 'success'].includes(calloutType) ? calloutType : 'note',
          text: calloutLines.join('\n')
        });
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        flushText();
        blocks.push({
          id: generateId(),
          type: 'quote',
          text: trimmed.substring(2)
        });
        continue;
      }

      // KaTeX Math Formula ($$ formula $$)
      if (trimmed.startsWith('$$')) {
        flushText();
        let formula = trimmed.replace(/\$\$/g, '').trim();
        if (!formula && i + 1 < lines.length) {
          i++;
          formula = lines[i].trim().replace(/\$\$/g, '');
        }
        blocks.push({
          id: generateId(),
          type: 'math',
          formula: formula || 'E = mc²',
          isInline: false
        });
        continue;
      }

      // Outlines / Bullet items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
        flushText();
        const isNumbered = /^\d+\.\s/.test(trimmed);
        const text = isNumbered ? trimmed.replace(/^\d+\.\s+/, '') : trimmed.substring(2);
        const indentLevel = Math.min(4, Math.floor((line.length - line.trimStart().length) / 2));
        blocks.push({
          id: generateId(),
          type: 'outline',
          level: indentLevel,
          text,
          isNumbered
        });
        continue;
      }

      // Normal text / Headings with inline formatting spans
      if (!currentTextBlock) {
        currentTextBlock = {
          id: generateId(),
          type: 'text',
          text: '',
          spans: []
        };
      }

      if (currentTextBlock.text.length > 0) {
        currentTextBlock.text += '\n';
      }

      const lineOffset = currentTextBlock.text.length;

      if (trimmed.startsWith('# ')) {
        const text = trimmed.substring(2);
        currentTextBlock.text += text;
        currentTextBlock.spans.push({
          type: 'HEADING_1',
          start: lineOffset,
          end: lineOffset + text.length
        });
      } else if (trimmed.startsWith('## ')) {
        const text = trimmed.substring(3);
        currentTextBlock.text += text;
        currentTextBlock.spans.push({
          type: 'HEADING_2',
          start: lineOffset,
          end: lineOffset + text.length
        });
      } else if (trimmed.startsWith('### ')) {
        const text = trimmed.substring(4);
        currentTextBlock.text += text;
        currentTextBlock.spans.push({
          type: 'HEADING_3',
          start: lineOffset,
          end: lineOffset + text.length
        });
      } else {
        currentTextBlock.text += line;
      }
    }

    if (inCodeBlock && codeLines.length > 0) {
      blocks.push({
        id: generateId(),
        type: 'code',
        language: codeLanguage,
        code: codeLines.join('\n')
      });
    }

    flushText();

    if (blocks.length === 0) {
      blocks.push({ id: generateId(), type: 'text', text: '', spans: [] });
    }

    return blocks;
  }

  /**
   * Converts a list of blocks to clean human-readable text for card preview and search.
   */
  static toPlainText(blocks: NotesnookBlock[]): string {
    if (!blocks || blocks.length === 0) return '';
    const parts: string[] = [];

    for (const block of blocks) {
      switch (block.type) {
        case 'text':
          if (block.text && block.text.trim()) {
            parts.push(block.text);
          }
          break;
        case 'table':
          parts.push(`📊 [Table ${block.rows}×${block.cols}]`);
          break;
        case 'horizontal_rule':
          parts.push('────────');
          break;
        case 'code':
          parts.push(`💻 [${block.language || 'Code'}] ${block.code ? block.code.substring(0, 100) : ''}`);
          break;
        case 'math':
          parts.push(`∑ ${block.formula}`);
          break;
        case 'callout': {
          const emoji =
            block.calloutType === 'warning'
              ? '⚠️'
              : block.calloutType === 'important'
              ? '📌'
              : block.calloutType === 'tip'
              ? '🚀'
              : block.calloutType === 'success'
              ? '✅'
              : '💡';
          parts.push(`${emoji} ${block.text}`);
          break;
        }
        case 'quote':
          parts.push(`“ ${block.text}`);
          break;
        case 'outline': {
          const indent = '  '.repeat(block.level || 0);
          parts.push(`${indent}• ${block.text}`);
          break;
        }
        case 'embed':
          parts.push(`▶️ ${block.embedType}: ${block.title || block.url}`);
          break;
        case 'attachment':
          parts.push(`📎 ${block.fileName} (${block.fileSize})`);
          break;
        case 'image':
          parts.push(`🖼️ ${block.caption || 'Image'}`);
          break;
      }
    }

    return parts.join('\n');
  }

  /**
   * Converts raw content string (block JSON or plain text) to clean plain text.
   */
  static rawToPlainText(rawContent: string): string {
    if (!rawContent) return '';
    if (rawContent.includes(BLOCKS_PREFIX) || rawContent.includes(TABLE_START)) {
      return this.toPlainText(this.parse(rawContent));
    }
    return rawContent.replace(/<[^>]*>?/gm, '');
  }
}
