import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [data, setData] = React.useState(initialData);
  const [selectedCells, setSelectedCells] = React.useState<string[]>([]);
  const [editingCell, setEditingCell] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<TData[][]>([initialData]);
  const [historyIndex, setHistoryIndex] = React.useState(0);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) => {
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
    },
  });

  const updateData = (rowIndex: number, columnId: string, value: any) => {
    const newData = data.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, [columnId]: value };
      }
      return row;
    });
    const newHistory = [...history.slice(0, historyIndex + 1), newData];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setData(newData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingCell) {
      const [rowIndex, colIndex] = editingCell.split('-').map(Number);
      let newRow = rowIndex;
      let newCol = colIndex;

      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        setEditingCell(null);
        if (e.shiftKey) {
          newCol = colIndex > 0 ? colIndex - 1 : columns.length - 1;
          if (colIndex === 0) newRow = rowIndex > 0 ? rowIndex - 1 : data.length - 1;
        } else {
          newCol = colIndex < columns.length - 1 ? colIndex + 1 : 0;
          if (colIndex === columns.length - 1) newRow = rowIndex < data.length - 1 ? rowIndex + 1 : 0;
        }
        setSelectedCells([`${newRow}-${newCol}`]);
      } else if (e.key.match(/^[a-zA-Z0-9]$/)) {
        setEditingCell(editingCell);
      }
    } else if (selectedCells.length > 0) {
      const [rowIndex, colIndex] = selectedCells[0].split('-').map(Number);
      let newRow = rowIndex;
      let newCol = colIndex;

      if (e.key === 'ArrowUp') newRow = Math.max(0, rowIndex - 1);
      if (e.key === 'ArrowDown') newRow = Math.min(data.length - 1, rowIndex + 1);
      if (e.key === 'ArrowLeft') newCol = Math.max(0, colIndex - 1);
      if (e.key === 'ArrowRight') newCol = Math.min(columns.length - 1, colIndex + 1);

      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        setSelectedCells([`${newRow}-${newCol}`]);
      } else if (e.key.match(/^[a-zA-Z0-9]$/)) {
        setEditingCell(selectedCells[0]);
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      const textToCopy = selectedCells.map(cellId => {
        const [rowIndex, colIndex] = cellId.split('-').map(Number);
        const cell = table.getRowModel().rows[rowIndex].getVisibleCells()[colIndex];
        return flexRender(cell.column.columnDef.cell, cell.getContext());
      }).join('\t');
      navigator.clipboard.writeText(textToCopy);
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      navigator.clipboard.readText().then(text => {
        const [startRow, startCol] = selectedCells[0].split('-').map(Number);
        const rows = text.split('\n').map(row => row.split('\t'));
        const newData = [...data];
        rows.forEach((row, i) => {
          row.forEach((cellValue, j) => {
            const rowIndex = startRow + i;
            const colIndex = startCol + j;
            if (rowIndex < data.length && colIndex < columns.length) {
              const columnId = columns[colIndex].id!;
              newData[rowIndex] = { ...newData[rowIndex], [columnId]: cellValue };
            }
          });
        });
        const newHistory = [...history.slice(0, historyIndex + 1), newData];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setData(newData);
      });
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setData(history[historyIndex - 1]);
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setData(history[historyIndex + 1]);
      }
    }
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter all columns..."
          value={globalFilter ?? ''}
          onChange={(event) =>
            setGlobalFilter(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell, colIndex) => (
                    <TableCell
                      key={cell.id}
                      onClick={() => setSelectedCells([`${rowIndex}-${colIndex}`])}
                      onDoubleClick={() => setEditingCell(`${rowIndex}-${colIndex}`)}
                      className={selectedCells.includes(`${rowIndex}-${colIndex}`) ? 'bg-blue-200' : ''}
                    >
                      {editingCell === `${rowIndex}-${colIndex}` ? (
                        <input
                          defaultValue={cell.getValue() as string}
                          onBlur={(e) => {
                            updateData(rowIndex, cell.column.id, e.target.value);
                            setEditingCell(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}