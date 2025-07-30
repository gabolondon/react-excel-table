import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

const samples = [
  {
    id: "id-tqn5qayh0",
    sampleId: "25a4bf47",
    donorId: "OSD_29J8SXU",
    gender: "Male",
    assaysPerformed: [
      {
        id: "a-54hnx",
        name: "CyTOF",
        type: "Transcriptomics",
        date: "2018-10-19",
        status: "complete",
      },
      {
        id: "a-6erzb",
        name: "ATAC-seq",
        type: "Transcriptomics",
        date: "2021-12-13",
        status: "received",
      },
    ],
    isPooled: false,
    collectionDate: "2018-02-16",
    sampleType: "Blood",
    status: "Running Analysis",
    tissueOrigin: "Breast",
    processingPriority: "Low",
    lastUpdated: "2020-02-21T02:27:22.860Z",
    totalReadCount: 4368989,
    projectId: "OS-P-0026",
  },
  {
    id: "id-r3mx2org7",
    sampleId: "9b2bdf9e-e0ef-49ae-adf8-0e910ae5a3a5",
    donorId: "OSD_73L74M7",
    gender: "Male",
    assaysPerformed: [
      {
        id: "a-99l5l",
        name: "osTCR",
        type: "Immune Repertoire",
        date: "2024-10-08",
        status: "sequencing",
      },
    ],
    isPooled: false,
    collectionDate: "2019-02-25",
    sampleType: "Blood",
    status: "Processing Error",
    tissueOrigin: "Breast",
    processingPriority: "STAT",
    lastUpdated: "2022-11-09T02:34:44.080Z",
    totalReadCount: 3002827,
    projectId: "OS-P-0050",
  },
  {
    id: "id-o2k29hr4u",
    sampleId: "c3258da1",
    donorId: "OSD_73L74M7",
    gender: "Male",
    assaysPerformed: [
      {
        id: "a-s9hmm",
        name: "CyTOF",
        type: "Transcriptomics",
        date: "2021-12-22",
        status: "analysis",
      },
      {
        id: "a-x2g4z",
        name: "scRNA-seq",
        type: "Transcriptomics",
        date: "2022-06-12",
        status: "processing",
      },
      {
        id: "a-hcmj1",
        name: "osBCR",
        type: "Transcriptomics",
        date: "2024-09-29",
        status: "analysis",
      },
    ],
    isPooled: false,
    collectionDate: "2021-06-18",
    sampleType: "Blood",
    status: "Processing Error",
    tissueOrigin: "Breast",
    processingPriority: "High",
    lastUpdated: "2025-03-23T21:12:53.636Z",
    totalReadCount: 4857342,
    projectId: "OS-P-0024",
  },
];

const columnHelper = createColumnHelper();

const formatValue = (val, columnId) => {
  if (val === null || val === undefined) return "";
  if (columnId === "assaysPerformed") {
    return `${val?.length || 0} assays`;
  }
  if (columnId === "isPooled") {
    return val ? "Yes" : "No";
  }
  if (columnId === "lastUpdated" || columnId === "collectionDate") {
    const date = new Date(val);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : val || "";
  }
  if (columnId === "totalReadCount") {
    const num = Number(val);
    return !isNaN(num) ? num.toLocaleString() : val || "";
  }
  return val;
};

export const EditableCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  const cellId = `${row.id}-${column.id}`;
  const {
    selectedCells,
    editingCell,
    setEditingCell,
    handleCellSelect,
    activeCell,
  } = table.options.meta;
  const isSelected = selectedCells.has(cellId);
  const isCellEditing = editingCell === cellId;
  const isActive = activeCell === cellId;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isCellEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isCellEditing]);

  const onBlur = () => {
    table.options.meta.updateData(row.index, column.id, value);
    setEditingCell(null);
  };

  const onDoubleClick = (e) => {
    e.stopPropagation();
    setEditingCell(cellId);
  };

  const onMouseDown = (e) => {
    handleCellSelect(cellId, e);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onBlur();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      onBlur();
      table.options.meta.handleTab(row.index, column.id, e.shiftKey);
    }
    if (e.key === "Escape") {
      setValue(initialValue);
      setEditingCell(null);
    }
  };

  if (isCellEditing) {
    return (
      <input
        ref={inputRef}
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        className="w-full h-full px-2 py-1 bg-white border-2 border-blue-500 outline-none"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      className={`h-full px-2 py-1 cursor-cell select-none ${
        isSelected ? "bg-blue-100" : ""
      } ${
        isActive
          ? "border-2 border-blue-500"
          : "border border-transparent hover:bg-gray-50"
      }`}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
    >
      {formatValue(value, column.id)}
    </div>
  );
};

export default function SamplesTable() {
  const [data, setData] = useState(samples);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const tableRef = useRef(null);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("sampleId", {
        header: "Sample ID",
        cell: EditableCell,
      }),
      columnHelper.accessor("donorId", {
        header: "Donor ID",
        cell: EditableCell,
      }),
      columnHelper.accessor("gender", {
        header: "Gender",
        cell: EditableCell,
      }),
      columnHelper.accessor("assaysPerformed", {
        header: "Assays",
        cell: EditableCell,
        enableEditing: false,
      }),
      columnHelper.accessor("isPooled", {
        header: "Pooled",
        cell: EditableCell,
      }),
      columnHelper.accessor("collectionDate", {
        header: "Collection Date",
        cell: EditableCell,
      }),
      columnHelper.accessor("sampleType", {
        header: "Sample Type",
        cell: EditableCell,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: EditableCell,
      }),
      columnHelper.accessor("tissueOrigin", {
        header: "Tissue Origin",
        cell: EditableCell,
      }),
      columnHelper.accessor("processingPriority", {
        header: "Priority",
        cell: EditableCell,
      }),
      columnHelper.accessor("totalReadCount", {
        header: "Read Count",
        cell: EditableCell,
      }),
      columnHelper.accessor("projectId", {
        header: "Project ID",
        cell: EditableCell,
      }),
    ],
    []
  );

  const updateData = useCallback((rowIndex, columnId, value) => {
    setData((old) =>
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
  }, []);

  const handleCellSelect = useCallback(
    (cellId, event) => {
      if (editingCell) return;

      const [rowId, columnId] = cellId.split("-");

      if (event.shiftKey && selectionStart) {
        const [startRowId, startColumnId] = selectionStart.split("-");
        const startRowIndex = parseInt(startRowId);
        const endRowIndex = parseInt(rowId);
        const startColIndex = columns.findIndex(
          (col) => col.accessorKey === startColumnId
        );
        const endColIndex = columns.findIndex(
          (col) => col.accessorKey === columnId
        );

        const minRow = Math.min(startRowIndex, endRowIndex);
        const maxRow = Math.max(startRowIndex, endRowIndex);
        const minCol = Math.min(startColIndex, endColIndex);
        const maxCol = Math.max(startColIndex, endColIndex);

        const newSelection = new Set();
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            newSelection.add(`${r}-${columns[c].accessorKey}`);
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
    (e) => {
      if (!isSelecting || !selectionStart || editingCell) return;

      const cell = e.target.closest("[data-cell-id]");
      if (!cell) return;

      const cellId = cell.dataset.cellId;
      if (cellId === activeCell) return;

      setActiveCell(cellId);

      const [rowId, columnId] = cellId.split("-");
      const [startRowId, startColumnId] = selectionStart.split("-");

      const startRowIndex = parseInt(startRowId);
      const endRowIndex = parseInt(rowId);
      const startColIndex = columns.findIndex(
        (col) => col.accessorKey === startColumnId
      );
      const endColIndex = columns.findIndex(
        (col) => col.accessorKey === columnId
      );

      const minRow = Math.min(startRowIndex, endRowIndex);
      const maxRow = Math.max(startRowIndex, endRowIndex);
      const minCol = Math.min(startColIndex, endColIndex);
      const maxCol = Math.max(startColIndex, endColIndex);

      const newSelection = new Set();
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newSelection.add(`${r}-${columns[c].accessorKey}`);
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
        colIndex: columns.findIndex((c) => c.accessorKey === col),
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
  }, [selectedCells, data, columns]);

  const handlePaste = useCallback(
    async (startCell) => {
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
        (c) => c.accessorKey === startColumnId
      );

      const newUpdatedCells = new Set();

      setData((oldData) => {
        const newData = oldData.map((r) => ({ ...r }));
        pastedRows.forEach((row, rowIndexOffset) => {
          const tableRowIndex = startRowIndex + rowIndexOffset;
          if (tableRowIndex < newData.length) {
            row.forEach((cellValue, colIndexOffset) => {
              const tableColIndex = startColIndex + colIndexOffset;
              if (tableColIndex < columns.length) {
                const column = columns[tableColIndex];
                const columnId = column.accessorKey;

                if (column.enableEditing === false) return;

                let parsedValue = cellValue;
                if (columnId === "isPooled") {
                  const lowerCellValue = cellValue.trim().toLowerCase();
                  parsedValue =
                    lowerCellValue === "yes" || lowerCellValue === "true";
                } else if (columnId === "totalReadCount") {
                  const num = parseInt(cellValue.replace(/,/g, ""), 10);
                  if (!isNaN(num)) {
                    parsedValue = num;
                  }
                } else if (
                  columnId === "collectionDate" ||
                  columnId === "lastUpdated"
                ) {
                  const d = new Date(cellValue);
                  if (!isNaN(d.getTime())) {
                    parsedValue = d.toISOString();
                  }
                }

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
    [selectionStart, columns]
  );

  const handleTab = useCallback(
    (rowIndex, colId, shiftKey) => {
      const colIndex = columns.findIndex((c) => c.accessorKey === colId);
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
        // Optionally add a new row
        // setData(old => [...old, { ...empty_row_data }])
        // nextRow = data.length;
        return; // For now, just stop
      }

      const nextCellId = `${nextRow}-${columns[nextCol].accessorKey}`;
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
    const handleKeyDown = (e) => {
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
          const column = columns.find((c) => c.accessorKey === colId);
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
          let colIndex = columns.findIndex((c) => c.accessorKey === colId);

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

          const newActiveCellId = `${rowIndex}-${columns[colIndex].accessorKey}`;

          if (e.shiftKey) {
            setActiveCell(newActiveCellId);
            const [startRowId, startColumnId] = selectionStart.split("-");
            const startRowIndex = parseInt(startRowId);
            const startColIndex = columns.findIndex(
              (c) => c.accessorKey === startColumnId
            );

            const minRow = Math.min(startRowIndex, rowIndex);
            const maxRow = Math.max(startRowIndex, rowIndex);
            const minCol = Math.min(startColIndex, colIndex);
            const maxCol = Math.max(startColIndex, colIndex);

            const newSelection = new Set();
            for (let r = minRow; r <= maxRow; r++) {
              for (let c = minCol; c <= maxCol; c++) {
                newSelection.add(`${r}-${columns[c].accessorKey}`);
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
    },
  });

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">Samples Table</h2>
      <div className="mb-4 text-sm text-gray-600">
        • Single click to select • Double click or Enter to edit • Arrow keys to
        navigate • Shift+click or Shift+arrows for range selection •
        Ctrl/Cmd+click for multi-select • Ctrl/Cmd+C to copy • Ctrl/Cmd+V to
        paste
      </div>

      <div className="overflow-auto border border-gray-300 rounded-lg">
        <table ref={tableRef} className="w-full bg-white border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50">
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
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
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Selected cells: {selectedCells.size}
      </div>
    </div>
  );
}