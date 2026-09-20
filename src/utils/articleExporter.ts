import { NoteEntity } from '../types/notes';
import { NotesnookBlockManager } from './notesnookBlockManager';

export class ArticleExporter {
  /**
   * Generates a clean Markdown export with block representations.
   */
  static toMarkdown(note: NoteEntity, includeFrontmatter = false): string {
    const blocks = NotesnookBlockManager.parse(note.content);
    let md = '';

    if (includeFrontmatter) {
      md += '---\n';
      md += `title: "${note.title.replace(/"/g, '\\"')}"\n`;
      md += `created: "${new Date(note.createdAt).toISOString()}"\n`;
      md += `updated: "${new Date(note.updatedAt).toISOString()}"\n`;
      if (note.labelsJson) {
        try {
          const tags = JSON.parse(note.labelsJson);
          if (Array.isArray(tags) && tags.length > 0) {
            md += `tags: [${tags.map(t => `"${t}"`).join(', ')}]\n`;
          }
        } catch {}
      }
      md += `color: "${note.colorKey || 'default'}"\n`;
      md += '---\n\n';
    }

    md += `# ${note.title}\n\n`;

    if (note.isChecklist && note.checklistJson) {
      try {
        const items = JSON.parse(note.checklistJson);
        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            md += `- [${item.isChecked ? 'x' : ' '}] ${item.text}\n`;
          }
          md += '\n';
        }
      } catch {}
    }

    for (const block of blocks) {
      switch (block.type) {
        case 'text':
          md += `${block.text}\n\n`;
          break;
        case 'table': {
          if (block.data && block.data.length > 0) {
            // Header row
            const headers = block.data[0] || [];
            md += `| ${headers.map(h => (h || '').trim()).join(' | ')} |\n`;
            md += `| ${headers.map(() => '---').join(' | ')} |\n`;
            for (let r = 1; r < block.data.length; r++) {
              const row = block.data[r] || [];
              md += `| ${row.map(c => (c || '').trim()).join(' | ')} |\n`;
            }
            md += '\n';
          }
          break;
        }
        case 'horizontal_rule':
          md += '---\n\n';
          break;
        case 'code':
          md += `\`\`\`${block.language || ''}\n${block.code}\n\`\`\`\n\n`;
          break;
        case 'math':
          md += `$$\n${block.formula}\n$$\n\n`;
          break;
        case 'callout':
          md += `> [!${(block.calloutType || 'NOTE').toUpperCase()}]\n`;
          for (const l of block.text.split('\n')) {
            md += `> ${l}\n`;
          }
          md += '\n';
          break;
        case 'quote':
          for (const l of block.text.split('\n')) {
            md += `> ${l}\n`;
          }
          md += '\n';
          break;
        case 'outline': {
          const indent = '  '.repeat(block.level || 0);
          md += `${indent}${block.isNumbered ? '1.' : '-'} ${block.text}\n`;
          break;
        }
        case 'embed':
          md += `[${block.embedType}: ${block.title || block.url}](${block.url})\n\n`;
          break;
        case 'attachment':
          md += `📎 **Attachment:** [${block.fileName}](${block.uri}) (${block.fileSize})\n\n`;
          break;
        case 'image':
          md += `![${block.caption || 'Image'}](${block.uri})\n\n`;
          break;
      }
    }

    return md;
  }

  /**
   * Generates a styled standalone HTML file with dark/light responsive CSS.
   */
  static toHtml(note: NoteEntity): string {
    const blocks = NotesnookBlockManager.parse(note.content);
    let bodyContent = '';

    if (note.isChecklist && note.checklistJson) {
      try {
        const items = JSON.parse(note.checklistJson);
        if (Array.isArray(items) && items.length > 0) {
          bodyContent += '<div class="checklist-section"><h3>Checklist</h3><ul class="checklist">';
          for (const item of items) {
            bodyContent += `<li class="${item.isChecked ? 'checked' : ''}"><input type="checkbox" ${item.isChecked ? 'checked' : ''} disabled /> <span>${escapeHtml(item.text)}</span></li>`;
          }
          bodyContent += '</ul></div>';
        }
      } catch {}
    }

    for (const block of blocks) {
      switch (block.type) {
        case 'text':
          bodyContent += `<p>${escapeHtml(block.text).replace(/\n/g, '<br/>')}</p>`;
          break;
        case 'table': {
          if (block.data && block.data.length > 0) {
            bodyContent += '<div class="table-wrapper"><table>';
            const headers = block.data[0];
            bodyContent += '<thead><tr>';
            for (const h of headers) {
              bodyContent += `<th>${escapeHtml(h)}</th>`;
            }
            bodyContent += '</tr></thead><tbody>';
            for (let r = 1; r < block.data.length; r++) {
              bodyContent += '<tr>';
              for (const c of block.data[r]) {
                bodyContent += `<td>${escapeHtml(c)}</td>`;
              }
              bodyContent += '</tr>';
            }
            bodyContent += '</tbody></table></div>';
          }
          break;
        }
        case 'horizontal_rule':
          bodyContent += '<hr/>';
          break;
        case 'code':
          bodyContent += `<div class="code-block"><div class="code-lang">${escapeHtml(block.language)}</div><pre><code>${escapeHtml(block.code)}</code></pre></div>`;
          break;
        case 'math':
          bodyContent += `<div class="math-block">$$ ${escapeHtml(block.formula)} $$</div>`;
          break;
        case 'callout':
          bodyContent += `<div class="callout callout-${block.calloutType}"><strong>[${block.calloutType.toUpperCase()}]</strong><p>${escapeHtml(block.text)}</p></div>`;
          break;
        case 'quote':
          bodyContent += `<blockquote>${escapeHtml(block.text)}</blockquote>`;
          break;
        case 'outline': {
          const ml = (block.level || 0) * 20;
          bodyContent += `<div class="outline-item" style="margin-left: ${ml}px;">• ${escapeHtml(block.text)}</div>`;
          break;
        }
        case 'image':
          bodyContent += `<figure><img src="${escapeHtml(block.uri)}" alt="${escapeHtml(block.caption)}" /><figcaption>${escapeHtml(block.caption)}</figcaption></figure>`;
          break;
        case 'embed':
          bodyContent += `<div class="embed-box"><a href="${escapeHtml(block.url)}" target="_blank">${escapeHtml(block.title || block.url)}</a></div>`;
          break;
      }
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(note.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.65;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1F2937;
      background: #FAFAFA;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background: #0F1115;
        color: #F9FAFB;
      }
      table, th, td {
        border-color: #262B35 !important;
      }
      th {
        background: #1C212B !important;
        color: #F9FAFB !important;
      }
      pre {
        background: #161920 !important;
      }
      blockquote {
        border-left-color: #22C55E !important;
        background: #161920 !important;
      }
    }
    h1 {
      font-size: 2.25rem;
      border-bottom: 2px solid #22C55E;
      padding-bottom: 8px;
    }
    .meta {
      font-size: 0.875rem;
      color: #6B7280;
      margin-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    th, td {
      border: 1px solid #E5E7EB;
      padding: 10px 14px;
      text-align: left;
    }
    th {
      background: #F3F4F6;
    }
    pre {
      background: #1E293B;
      color: #F8FAFC;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
    }
    blockquote {
      border-left: 4px solid #22C55E;
      margin: 16px 0;
      padding: 8px 16px;
      background: #F0FDF4;
    }
    .callout {
      padding: 12px 16px;
      border-radius: 8px;
      margin: 16px 0;
      border-left: 4px solid #3B82F6;
      background: #EFF6FF;
    }
    .callout-warning {
      border-left-color: #F59E0B;
      background: #FEF3C7;
    }
    .callout-tip {
      border-left-color: #10B981;
      background: #ECFDF5;
    }
    .checklist {
      list-style: none;
      padding-left: 0;
    }
    .checklist li {
      margin: 6px 0;
    }
    .checklist li.checked span {
      text-decoration: line-through;
      color: #9CA3AF;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(note.title)}</h1>
  <div class="meta">Created: ${new Date(note.createdAt).toLocaleString()} | Updated: ${new Date(note.updatedAt).toLocaleString()}</div>
  ${bodyContent}
</body>
</html>`;
  }

  /**
   * Generates a plain text representation.
   */
  static toPlainText(note: NoteEntity): string {
    const blocks = NotesnookBlockManager.parse(note.content);
    let text = `${note.title}\n${'='.repeat(note.title.length)}\n\n`;

    if (note.isChecklist && note.checklistJson) {
      try {
        const items = JSON.parse(note.checklistJson);
        if (Array.isArray(items) && items.length > 0) {
          text += 'Checklist:\n';
          for (const item of items) {
            text += `[${item.isChecked ? 'X' : ' '}] ${item.text}\n`;
          }
          text += '\n';
        }
      } catch {}
    }

    text += NotesnookBlockManager.toPlainText(blocks);
    return text;
  }

  /**
   * Triggers a browser file download for any string payload.
   */
  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
