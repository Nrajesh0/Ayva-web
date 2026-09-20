import React, { useState } from 'react';
import { TableBlock } from '../types/notes';
import { Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Grid, MoveHorizontal } from 'lucide-react';

interface TableBlockEditorProps {
  block: TableBlock;
  onChange: (updated: TableBlock) => void;
  onDelete: () => void;
  isReadOnly?: boolean;
}

export const TableBlockEditor: React.FC<TableBlockEditorProps> = ({
  block,
  onChange,
  onDelete,
  isReadOnly = false
}) => {
  const [showMatrixSelector, setShowMatrixSelector] = useState(false);
  const [hoverRow, setHoverRow] = useState(block.rows);
  const [hoverCol, setHoverCol] = useState(block.cols);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);

  const updateCell = (r: number, c: number, val: string) => {
    const newData = block.data.map((row, rowIdx) =>
      rowIdx === r ? row.map((cell, colIdx) => (colIdx === c ? val : cell)) : [...row]
    );
    onChange({ ...block, data: newData });
  };

  const insertRow = (index: number) => {
    const newCols = block.cols;
    const emptyRow = new Array(newCols).fill('');
    const newData = [...block.data];
    newData.splice(index, 0, emptyRow);
    onChange({
      ...block,
      rows: block.rows + 1,
      data: newData
    });
  };

  const deleteRow = (index: number) => {
    if (block.rows <= 1) return;
    const newData = block.data.filter((_, i) => i !== index);
    onChange({
      ...block,
      rows: block.rows - 1,
      data: newData
    });
  };

  const insertColumn = (index: number) => {
    const newData = block.data.map(row => {
      const copy = [...row];
      copy.splice(index, 0, '');
      return copy;
    });
    onChange({
      ...block,
      cols: block.cols + 1,
      data: newData
    });
  };

  const deleteColumn = (index: number) => {
    if (block.cols <= 1) return;
    const newData = block.data.map(row => row.filter((_, i) => i !== index));
    onChange({
      ...block,
      cols: block.cols - 1,
      data: newData
    });
  };

  const resizeGrid = (newRows: number, newCols: number) => {
    const rows = Math.max(1, Math.min(12, newRows));
    const cols = Math.max(1, Math.min(8, newCols));
    const newData: string[][] = [];

    for (let r = 0; r < rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(block.data[r]?.[c] || '');
      }
      newData.push(row);
    }

    onChange({
      ...block,
      rows,
      cols,
      data: newData
    });
    setShowMatrixSelector(false);
  };

  return (
    <div id={`table-block-${block.id}`} className="group relative my-4 rounded-xl border border-[#262B35] bg-[#161920] p-4 transition-all hover:border-[#333A48]">
      {/* Table Header Controls */}
      <div className="mb-3 flex items-center justify-between border-b border-[#262B35] pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-[#1E232D] px-2.5 py-1 text-xs font-semibold text-[#22C55E]">
            <Grid className="h-3.5 w-3.5" />
            Table ({block.rows} × {block.cols})
          </div>

          {!isReadOnly && (
            <div className="relative">
              <button
                id={`btn-table-matrix-${block.id}`}
                onClick={() => setShowMatrixSelector(!showMatrixSelector)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#9CA3AF] hover:bg-[#262B35] hover:text-white"
                title="Resize Grid Matrix"
              >
                <MoveHorizontal className="h-3 w-3" />
                Dimensions
              </button>

              {/* Interactive Matrix Selector */}
              {showMatrixSelector && (
                <div className="absolute left-0 top-8 z-30 w-56 rounded-xl border border-[#262B35] bg-[#1E232D] p-3 shadow-2xl">
                  <div className="mb-2 text-xs font-medium text-[#9CA3AF]">
                    Select Table Size: <span className="text-white font-bold">{hoverRow} × {hoverCol}</span>
                  </div>
                  <div
                    className="grid gap-1"
                    style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}
                    onMouseLeave={() => {
                      setHoverRow(block.rows);
                      setHoverCol(block.cols);
                    }}
                  >
                    {Array.from({ length: 36 }).map((_, idx) => {
                      const r = Math.floor(idx / 6) + 1;
                      const c = (idx % 6) + 1;
                      const isHighlighted = r <= hoverRow && c <= hoverCol;
                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => {
                            setHoverRow(r);
                            setHoverCol(c);
                          }}
                          onClick={() => resizeGrid(r, c)}
                          className={`h-5 w-5 cursor-pointer rounded-sm border transition-colors ${
                            isHighlighted
                              ? 'border-[#22C55E] bg-[#22C55E]/30'
                              : 'border-[#333A48] bg-[#161920]'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#262B35] pt-2">
                    <button
                      onClick={() => resizeGrid(3, 3)}
                      className="text-[11px] text-[#22C55E] hover:underline"
                    >
                      Reset 3×3
                    </button>
                    <button
                      onClick={() => setShowMatrixSelector(false)}
                      className="text-[11px] text-[#9CA3AF] hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => insertRow(block.rows)}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-[#9CA3AF] hover:bg-[#262B35] hover:text-[#22C55E]"
              title="Add Row to Bottom"
            >
              <Plus className="h-3 w-3" /> +Row
            </button>
            <button
              onClick={() => insertColumn(block.cols)}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-[#9CA3AF] hover:bg-[#262B35] hover:text-[#22C55E]"
              title="Add Column to Right"
            >
              <Plus className="h-3 w-3" /> +Col
            </button>
            <button
              onClick={onDelete}
              className="rounded p-1 text-[#9CA3AF] hover:bg-red-500/20 hover:text-red-400"
              title="Delete Table"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto rounded-lg border border-[#262B35]">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[#1C212B]">
              {Array.from({ length: block.cols }).map((_, c) => (
                <th key={c} className="group/th relative border-b border-r border-[#262B35] p-2.5 font-semibold text-[#F9FAFB]">
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      value={block.data[0]?.[c] || ''}
                      onChange={e => updateCell(0, c, e.target.value)}
                      placeholder={`Header ${c + 1}`}
                      disabled={isReadOnly}
                      className="w-full bg-transparent font-medium text-[#F9FAFB] placeholder-[#6B7280] outline-none focus:text-[#22C55E]"
                    />
                    {!isReadOnly && block.cols > 1 && (
                      <button
                        onClick={() => deleteColumn(c)}
                        className="hidden rounded p-0.5 text-[#6B7280] hover:text-red-400 group-hover/th:block"
                        title="Delete Column"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: block.rows - 1 }).map((_, rowOffset) => {
              const r = rowOffset + 1;
              return (
                <tr key={r} className="border-b border-[#262B35] hover:bg-[#1E232D]/40">
                  {Array.from({ length: block.cols }).map((_, c) => (
                    <td key={c} className="border-r border-[#262B35] p-2">
                      <input
                        type="text"
                        value={block.data[r]?.[c] || ''}
                        onChange={e => updateCell(r, c, e.target.value)}
                        onFocus={() => setActiveCell({ r, c })}
                        placeholder="Cell content..."
                        disabled={isReadOnly}
                        className="w-full rounded bg-transparent px-1.5 py-1 text-[#F9FAFB] placeholder-[#4B5563] outline-none transition-colors focus:bg-[#1E232D] focus:ring-1 focus:ring-[#22C55E]"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Row context action helper if active cell */}
      {!isReadOnly && activeCell && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-[#9CA3AF]">
          <span>Row {activeCell.r + 1}:</span>
          <button
            onClick={() => insertRow(activeCell.r)}
            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 hover:bg-[#262B35] hover:text-white"
          >
            <ArrowUp className="h-2.5 w-2.5" /> Insert above
          </button>
          <button
            onClick={() => insertRow(activeCell.r + 1)}
            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 hover:bg-[#262B35] hover:text-white"
          >
            <ArrowDown className="h-2.5 w-2.5" /> Insert below
          </button>
          {block.rows > 2 && (
            <button
              onClick={() => deleteRow(activeCell.r)}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-2.5 w-2.5" /> Delete row
            </button>
          )}
        </div>
      )}
    </div>
  );
};
