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

export const EditableCell = ({ getValue, row, column, table }) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const cellId = `${row.id}-${column.id}`;
  const { selectedCells, editingCell, setEditingCell, handleCellSelect } =
    table.options.meta;
  const isSelected = selectedCells.has(cellId);
  const isCellEditing = editingCell === cellId;

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
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      onBlur();
    }
    if (e.key === "Escape") {
      setValue(initialValue);
      setEditingCell(null);
    }
  };

  // Format display value based on column type
  const formatValue = (val) => {
    if (column.id === "assaysPerformed") {
      return `${val?.length || 0} assays`;
    }
    if (column.id === "isPooled") {
      return val ? "Yes" : "No";
    }
    if (column.id === "lastUpdated" || column.id === "collectionDate") {
      return new Date(val).toLocaleDateString();
    }
    if (column.id === "totalReadCount") {
      return val?.toLocaleString();
    }
    return val;
  };

  if (isCellEditing) {
    return (
      <input
        ref={inputRef}
        value={value}
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
        isSelected
          ? "bg-blue-100 border-2 border-blue-500"
          : "border border-transparent"
      } hover:bg-gray-50`}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
    >
      {formatValue(value)}
    </div>
  );
};

export default function SamplesTable() {
  const [data, setData] = useState(samples);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
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
        // Range selection
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
      } else if (event.ctrlKey || event.metaKey) {
        // Multi-select
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
      } else {
        // Single select
        setSelectedCells(new Set([cellId]));
        setSelectionStart(cellId);
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
    [isSelecting, selectionStart, editingCell, columns]
  );

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

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
    },
  });

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">Samples Table</h2>
      <div className="mb-4 text-sm text-gray-600">
        • Single click to select • Double click to edit • Shift+click for range
        selection • Ctrl/Cmd+click for multi-select
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
