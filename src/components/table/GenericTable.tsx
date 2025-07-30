import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Plus, Trash2, Copy, Clipboard } from "lucide-react";
import { EditableCell, type EditableCellProps } from "./EditableCell";

interface GenericTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  title: string;
  onDataChange?: (data: T[]) => void;
  createEmptyRow: () => T;
  formatValue?: (value: any, columnId: string) => string;
  parseValue?: (value: string, columnId: string, originalValue: any) => any;
}

const defaultFormatValue = (val: any, columnId: string): string => {
  if (val === null || val === undefined) return "";
  if (Array.isArray(val)) {
    return `${val.length} items`;
  }
  if (typeof val === "boolean") {
    return val ? "Yes" : "No";
  }
  if (val instanceof Date || (typeof val === "string" && !isNaN(Date.parse(val)))) {
    const date = new Date(val);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : val.toString();
  }
  if (typeof val === "number") {
    return val.toLocaleString();
  }
  return val.toString();
};

const defaultParseValue = (value: string, columnId: string, originalValue: any): any => {
  if (typeof originalValue === "boolean") {
    const lowerValue = value.trim().toLowerCase();
    return lowerValue === "yes" || lowerValue === "true" || lowerValue === "1";
  }
  if (typeof originalValue === "number") {
    const num = parseFloat(value.replace(/,/g, ""));
    return !isNaN(num) ? num : originalValue;
  }
  if (originalValue instanceof Date || (typeof originalValue === "string" && !isNaN(Date.parse(originalValue)))) {
    const d = new Date(value);
    return !isNaN(d.getTime()) ? d.toISOString() : value;
  }
  return value;
};

// Export the EditableCell for use in column definitions
export { EditableCell };

export default function GenericTable<T extends Record<string, any>>({
  data: initialData,
  columns,
  title,
  onDataChange,
  createEmptyRow,
  formatValue = defaultFormatValue,
  parseValue = defaultParseValue,
}: GenericTableProps<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [selectedCells, setSelectedCells] = useState(new Set<string>());
  const [selectedRows, setSelectedRows] = useState(new Set<string>());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Update external data when internal data changes
  useEffect(() => {
    onDataChange?.(data);
  }, [data, onDataChange]);

  // Row manipulation functions
  const addRow = () => {
    const newRow = createEmptyRow();
    setData(prev => [...prev, newRow]);
  };

  const insertRowAbove = () => {
    if (selectedRows.size === 0) {
      addRow();
      return;
    }
    const selectedRowIndices = Array.from(selectedRows).map(Number).sort((a, b) => a - b);
    const insertIndex = selectedRowIndices[0];
    const newRow = createEmptyRow();
    setData(prev => {
      const newData = [...prev];
      newData.splice(insertIndex, 0, newRow);
      return newData;
    });
    // Clear selections since row indices will change
    setSelectedRows(new Set());
    setSelectedCells(new Set());
  };

  const insertRowBelow = () => {
    if (selectedRows.size === 0) {
      addRow();
      return;
    }
    const selectedRowIndices = Array.from(selectedRows).map(Number).sort((a, b) => b - a);
    const insertIndex = selectedRowIndices[0] + 1;
    const newRow = createEmptyRow();
    setData(prev => {
      const newData = [...prev];
      newData.splice(insertIndex, 0, newRow);
      return newData;
    });
    // Clear selections since row indices will change
    setSelectedRows(new Set());
    setSelectedCells(new Set());
  };

  const deleteSelectedRows = () => {
    if (selectedRows.size === 0) return;
    const rowIndicesToDelete = Array.from(selectedRows).map(Number).sort((a, b) => b - a);
    setData(prev => {
      let newData = [...prev];
      rowIndicesToDelete.forEach(index => {
        newData.splice(index, 1);
      });
      return newData;
    });
    setSelectedRows(new Set());
    setSelectedCells(new Set());
    setActiveCell(null);
  };

  const handleRowSelect = (rowIndex: number, event: React.MouseEvent) => {
    if (event.shiftKey && selectedRows.size > 0) {
      // Range selection
      const existingIndices = Array.from(selectedRows).map(Number);
      const minExisting = Math.min(...existingIndices);
      const maxExisting = Math.max(...existingIndices);
      const start = Math.min(minExisting, rowIndex);
      const end = Math.max(maxExisting, rowIndex);
      const newSelection = new Set<string>();
      for (let i = start; i <= end; i++) {
        newSelection.add(i.toString());
      }
      setSelectedRows(newSelection);
    } else if (event.ctrlKey || event.metaKey) {
      // Toggle selection
      setSelectedRows(prev => {
        const newSet = new Set(prev);
        const rowKey = rowIndex.toString();
        if (newSet.has(rowKey)) {
          newSet.delete(rowKey);
        } else {
          newSet.add(rowKey);
        }
        return newSet;
      });
    } else {
      // Single selection
      setSelectedRows(new Set([rowIndex.toString()]));
    }
  };

  const updateData = useCallback((rowIndex: number, columnId: string, value: any) => {
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          const parsedValue = parseValue(value, columnId, old[rowIndex][columnId]);
          return {
            ...old[rowIndex],
            [columnId]: parsedValue,
          };
        }
        return row;
      })
    );
  }, [parseValue]);

  const handleCellSelect = useCallback(
    (cellId: string, event: React.MouseEvent) => {
      if (editingCell) return;

      const [rowId, columnId] = cellId.split("-");

      if (event.shiftKey && selectionStart) {
        const [startRowId, startColumnId] = selectionStart.split("-");
        const startRowIndex = parseInt(startRowId);
        const endRowIndex = parseInt(rowId);
        const startColIndex = columns.findIndex(
          (col: any) => col.accessorKey === startColumnId
        );
        const endColIndex = columns.findIndex(
          (col: any) => col.accessorKey === columnId
        );

        const minRow = Math.min(startRowIndex, endRowIndex);
        const maxRow = Math.max(startRowIndex, endRowIndex);
        const minCol = Math.min(startColIndex, endColIndex);
        const maxCol = Math.max(startColIndex, endColIndex);

        const newSelection = new Set<string>();
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            newSelection.add(`${r}-${(columns[c] as any).accessorKey}`);
          }
        }
        setSelectedCells(newSelection);
        setActiveCell(cellId);
      } else if (event.ctrlKey || event.metaKey) {
        setSelectedCells((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(cellId)) {
            newSet.delete(cellId);
          } else {
            newSet.add(cellId);
          }
          return newSet;
        });
        setSelectionStart(cellId);
        setActiveCell(cellId);
      } else {
        setSelectedCells(new Set([cellId]));
        setSelectionStart(cellId);
        setActiveCell(cellId);
        setIsSelecting(true);
      }
    },
    [editingCell, selectionStart, columns]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isSelecting || !selectionStart || editingCell) return;

      const cell = (e.target as Element).closest("[data-cell-id]") as HTMLElement;
      if (!cell) return;

      const cellId = cell.dataset.cellId!;
      if (cellId === activeCell) return;

      setActiveCell(cellId);

      const [rowId, columnId] = cellId.split("-");
      const [startRowId, startColumnId] = selectionStart.split("-");

      const startRowIndex = parseInt(startRowId);
      const endRowIndex = parseInt(rowId);
      const startColIndex = columns.findIndex(
        (col: any) => col.accessorKey === startColumnId
      );
      const endColIndex = columns.findIndex(
        (col: any) => col.accessorKey === columnId
      );

      const minRow = Math.min(startRowIndex, endRowIndex);
      const maxRow = Math.max(startRowIndex, endRowIndex);
      const minCol = Math.min(startColIndex, endColIndex);
      const maxCol = Math.max(startColIndex, endColIndex);

      const newSelection = new Set<string>();
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newSelection.add(`${r}-${(columns[c] as any).accessorKey}`);
        }
      }
      setSelectedCells(newSelection);
    },
    [isSelecting, selectionStart, editingCell, columns, activeCell]
  );

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (selectedCells.size === 0) return;

    const cellIds = [...selectedCells];
    const cells = cellIds.map((id) => {
      const [row, col] = id.split("-");
      return {
        rowIndex: parseInt(row, 10),
        colId: col,
        colIndex: columns.findIndex((c: any) => c.accessorKey === col),
      };
    });

    const minRow = Math.min(...cells.map((c) => c.rowIndex));
    const maxRow = Math.max(...cells.map((c) => c.rowIndex));
    const minCol = Math.min(...cells.map((c) => c.colIndex));
    const maxCol = Math.max(...cells.map((c) => c.colIndex));

    const grid = Array(maxRow - minRow + 1)
      .fill(null)
      .map(() => Array(maxCol - minCol + 1).fill(""));

    cells.forEach((cell) => {
      const value = data[cell.rowIndex][cell.colId];
      grid[cell.rowIndex - minRow][cell.colIndex - minCol] = formatValue(
        value,
        cell.colId
      );
    });

    const clipboardText = grid.map((row) => row.join("\t")).join("\n");
    navigator.clipboard.writeText(clipboardText);
  }, [selectedCells, data, columns, formatValue]);

  const handlePaste = useCallback(
    async (startCell?: string) => {
      const start = startCell || selectionStart;
      if (!start) return;

      const text = await navigator.clipboard.readText();
      const pastedRows = text
        .trim()
        .split("\n")
        .map((row) => row.split("\t"));

      if (pastedRows.length === 0) return;

      const [startRowId, startColumnId] = start.split("-");
      const startRowIndex = parseInt(startRowId, 10);
      const startColIndex = columns.findIndex(
        (c: any) => c.accessorKey === startColumnId
      );

      const newUpdatedCells = new Set<string>();

      setData((oldData) => {
        const newData = oldData.map((r) => ({ ...r }));
        pastedRows.forEach((row, rowIndexOffset) => {
          const tableRowIndex = startRowIndex + rowIndexOffset;
          if (tableRowIndex < newData.length) {
            row.forEach((cellValue, colIndexOffset) => {
              const tableColIndex = startColIndex + colIndexOffset;
              if (tableColIndex < columns.length) {
                const column = columns[tableColIndex] as any;
                const columnId = column.accessorKey;

                if (column.enableEditing === false) return;

                const parsedValue = parseValue(cellValue, columnId, newData[tableRowIndex][columnId]);
                newData[tableRowIndex][columnId] = parsedValue;
                newUpdatedCells.add(`${tableRowIndex}-${columnId}`);
              }
            });
          }
        });
        return newData;
      });

      setSelectedCells(newUpdatedCells);
    },
    [selectionStart, columns, parseValue]
  );

  const handleTab = useCallback(
    (rowIndex: number, colId: string, shiftKey: boolean) => {
      const colIndex = columns.findIndex((c: any) => c.accessorKey === colId);
      let nextRow = rowIndex;
      let nextCol = colIndex + (shiftKey ? -1 : 1);

      if (nextCol < 0) {
        nextCol = columns.length - 1;
        nextRow--;
      } else if (nextCol >= columns.length) {
        nextCol = 0;
        nextRow++;
      }

      if (nextRow < 0) {
        nextRow = data.length - 1;
      }

      if (nextRow >= data.length) {
        return; // For now, just stop
      }

      const nextCellId = `${nextRow}-${(columns[nextCol] as any).accessorKey}`;
      setSelectedCells(new Set([nextCellId]));
      setSelectionStart(nextCellId);
      setActiveCell(nextCellId);
      setTimeout(() => setEditingCell(nextCellId), 0);
    },
    [columns, data.length]
  );

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSelecting, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingCell) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        handleCopy();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        handlePaste();
        return;
      }

      if (activeCell) {
        if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9]/)) {
          const [rowId, colId] = activeCell.split("-");
          const column = columns.find((c: any) => c.accessorKey === colId) as any;
          if (column.enableEditing !== false) {
            e.preventDefault();
            updateData(parseInt(rowId), colId, e.key);
            setEditingCell(activeCell);
          }
          return;
        }

        if (e.key === "Enter") {
          e.preventDefault();
          setEditingCell(activeCell);
          return;
        }

        const arrowKeys = [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ];
        if (arrowKeys.includes(e.key)) {
          e.preventDefault();
          const [rowId, colId] = activeCell.split("-");
          let rowIndex = parseInt(rowId);
          let colIndex = columns.findIndex((c: any) => c.accessorKey === colId);

          switch (e.key) {
            case "ArrowUp":
              rowIndex = Math.max(0, rowIndex - 1);
              break;
            case "ArrowDown":
              rowIndex = Math.min(data.length - 1, rowIndex + 1);
              break;
            case "ArrowLeft":
              colIndex = Math.max(0, colIndex - 1);
              break;
            case "ArrowRight":
              colIndex = Math.min(columns.length - 1, colIndex + 1);
              break;
          }

          const newActiveCellId = `${rowIndex}-${(columns[colIndex] as any).accessorKey}`;

          if (e.shiftKey) {
            setActiveCell(newActiveCellId);
            const [startRowId, startColumnId] = selectionStart!.split("-");
            const startRowIndex = parseInt(startRowId);
            const startColIndex = columns.findIndex(
              (c: any) => c.accessorKey === startColumnId
            );

            const minRow = Math.min(startRowIndex, rowIndex);
            const maxRow = Math.max(startRowIndex, rowIndex);
            const minCol = Math.min(startColIndex, colIndex);
            const maxCol = Math.max(startColIndex, colIndex);

            const newSelection = new Set<string>();
            for (let r = minRow; r <= maxRow; r++) {
              for (let c = minCol; c <= maxCol; c++) {
                newSelection.add(`${r}-${(columns[c] as any).accessorKey}`);
              }
            }
            setSelectedCells(newSelection);
          } else {
            setSelectedCells(new Set([newActiveCellId]));
            setSelectionStart(newActiveCellId);
            setActiveCell(newActiveCellId);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleCopy,
    handlePaste,
    editingCell,
    activeCell,
    columns,
    data.length,
    selectionStart,
    updateData,
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData,
      selectedCells,
      editingCell,
      setEditingCell,
      handleCellSelect,
      activeCell,
      handleTab,
      formatValue,
    },
  });

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      
      {/* Toolbar */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Button
              onClick={addRow}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </Button>
            <Button
              onClick={insertRowAbove}
              size="sm"
              variant="outline"
              disabled={selectedRows.size === 0}
              className="flex items-center gap-1"
            >
              Insert Above
            </Button>
            <Button
              onClick={insertRowBelow}
              size="sm"
              variant="outline"
              disabled={selectedRows.size === 0}
              className="flex items-center gap-1"
            >
              Insert Below
            </Button>
          </div>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <Button
            onClick={deleteSelectedRows}
            size="sm"
            variant="destructive"
            disabled={selectedRows.size === 0}
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete Rows ({selectedRows.size})
          </Button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center gap-1">
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              disabled={selectedCells.size === 0}
              className="flex items-center gap-1"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <Button
              onClick={() => handlePaste()}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Clipboard className="w-4 h-4" />
              Paste
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        • Single click to select • Double click or Enter to edit • Arrow keys to
        navigate • Shift+click or Shift+arrows for range selection •
        Ctrl/Cmd+click for multi-select • Ctrl/Cmd+C to copy • Ctrl/Cmd+V to
        paste • Click row number to select entire row
      </div>

      <div className="overflow-auto border border-gray-300 rounded-lg">
        <table ref={tableRef} className="w-full bg-white border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50">
                <th className="w-12 px-2 py-2 text-sm font-semibold text-center text-gray-700 border border-gray-300 bg-gray-100">
                  #
                </th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2 py-2 text-sm font-semibold text-left text-gray-700 border border-gray-300 min-w-32"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const isRowSelected = selectedRows.has(row.index.toString());
              return (
                <tr 
                  key={row.id} 
                  className={`hover:bg-gray-50 ${
                    isRowSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <td 
                    className={`w-12 px-2 py-2 text-xs text-center border border-gray-300 bg-gray-50 cursor-pointer select-none font-mono ${
                      isRowSelected ? 'bg-blue-200 font-semibold' : 'hover:bg-gray-100'
                    }`}
                    onClick={(e) => handleRowSelect(row.index, e)}
                  >
                    {row.index + 1}
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      data-cell-id={`${row.index}-${cell.column.id}`}
                      className="h-10 p-0 border border-gray-300 min-w-32"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600 flex gap-4">
        <span>Selected cells: {selectedCells.size}</span>
        <span>Selected rows: {selectedRows.size}</span>
        <span>Total rows: {data.length}</span>
      </div>
    </div>
  );
}
