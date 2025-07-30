import React, { useState, useRef, useEffect } from "react";

export type CellInputType = 
  | "text" 
  | "number" 
  | "date" 
  | "datetime-local"
  | "email"
  | "tel"
  | "url"
  | "password"
  | "select"
  | "textarea"
  | "checkbox"
  | "color";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface EditableCellProps {
  getValue: () => any;
  row: any;
  column: any;
  table: any;
  inputType?: CellInputType;
  selectOptions?: SelectOption[];
  placeholder?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  rows?: number;
  disabled?: boolean;
  formatValue?: (value: any, columnId: string) => string;
}

const defaultFormatValue = (val: any, columnId: string): string => {
  if (val === null || val === undefined) return "";
  if (Array.isArray(val)) {
    return `${val.length} items`;
  }
  if (typeof val === "boolean") {
    return val ? "Yes" : "No";
  }
  if (val instanceof Date || (typeof val === "string" && val && !isNaN(Date.parse(val)))) {
    const date = new Date(val);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : (val ? val.toString() : "");
  }
  if (typeof val === "number") {
    return val.toLocaleString();
  }
  return val ? val.toString() : "";
};

export const EditableCell: React.FC<EditableCellProps> = ({
  getValue,
  row,
  column,
  table,
  inputType = "text",
  selectOptions = [],
  placeholder = "",
  min,
  max,
  step,
  rows = 3,
  disabled = false,
  formatValue = defaultFormatValue,
}) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

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
  const isDisabled = disabled || column.enableEditing === false;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isCellEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputType !== "checkbox" && inputType !== "color" && inputType !== "select") {
        // Only call select() for input elements (not select or textarea)
        if (inputRef.current instanceof HTMLInputElement) {
          inputRef.current.select();
        }
      }
    }
  }, [isCellEditing, inputType]);

  const parseValueForInput = (val: any): string | boolean => {
    if (val === null || val === undefined) {
      return inputType === "checkbox" ? false : "";
    }
    
    switch (inputType) {
      case "date":
        if (val instanceof Date) {
          return val.toISOString().split('T')[0];
        }
        if (typeof val === "string" && val && !isNaN(Date.parse(val))) {
          return new Date(val).toISOString().split('T')[0];
        }
        return "";
      
      case "datetime-local":
        if (val instanceof Date) {
          return val.toISOString().slice(0, 16);
        }
        if (typeof val === "string" && val && !isNaN(Date.parse(val))) {
          return new Date(val).toISOString().slice(0, 16);
        }
        return "";
      
      case "number":
        return typeof val === "number" ? val.toString() : (val ? val.toString() : "");
      
      case "checkbox":
        return Boolean(val);
      
      default:
        return val ? val.toString() : "";
    }
  };

  const parseValueForStorage = (inputValue: any): any => {
    switch (inputType) {
      case "number":
        const num = parseFloat(inputValue);
        return !isNaN(num) ? num : initialValue;
      
      case "date":
      case "datetime-local":
        if (!inputValue) return null;
        const date = new Date(inputValue);
        return !isNaN(date.getTime()) ? date.toISOString() : inputValue;
      
      case "checkbox":
        return Boolean(inputValue);
      
      default:
        return inputValue;
    }
  };

  const onBlur = () => {
    const parsedValue = parseValueForStorage(value);
    table.options.meta.updateData(row.index, column.id, parsedValue);
    setEditingCell(null);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    if (isDisabled) return;
    e.stopPropagation();
    setEditingCell(cellId);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    handleCellSelect(cellId, e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputType === "textarea" && !e.shiftKey) {
        // Allow Shift+Enter for new line in textarea
        return;
      }
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setValue(newValue);
    table.options.meta.updateData(row.index, column.id, newValue);
    setEditingCell(null);
  };

  const renderInput = () => {
    const commonProps = {
      className: "w-full h-full px-2 py-1 bg-white border-2 border-blue-500 outline-none",
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
      onKeyDown: handleKeyDown,
    };

    switch (inputType) {
      case "select":
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={value || ""}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            {...commonProps}
          >
            <option value="">Select...</option>
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value || ""}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={rows}
            {...commonProps}
            className="w-full h-auto min-h-[2.5rem] px-2 py-1 bg-white border-2 border-blue-500 outline-none resize-none"
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center justify-center h-full">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="checkbox"
              checked={Boolean(value)}
              onChange={handleCheckboxChange}
              className="w-4 h-4"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );

      case "color":
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="color"
            value={value || "#000000"}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            {...commonProps}
            className="w-full h-full border-2 border-blue-500 outline-none"
          />
        );

      default:
        const inputValue = parseValueForInput(value);
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={inputType}
            value={typeof inputValue === "string" ? inputValue : ""}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            {...commonProps}
          />
        );
    }
  };

  if (isCellEditing && !isDisabled) {
    return renderInput();
  }

  // Display mode
  return (
    <div
      className={`h-full px-2 py-1 cursor-cell select-none ${
        isSelected ? "bg-blue-100" : ""
      } ${
        isActive
          ? "border-2 border-blue-500"
          : "border border-transparent hover:bg-gray-50"
      } ${isDisabled ? "cursor-not-allowed opacity-60" : ""}`}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
    >
      {inputType === "checkbox" ? (
        <div className="flex items-center justify-center h-full">
          <input
            type="checkbox"
            checked={Boolean(value)}
            readOnly
            className="w-4 h-4 pointer-events-none"
          />
        </div>
      ) : inputType === "color" ? (
        <div className="flex items-center h-full gap-2">
          <div
            className="w-4 h-4 border border-gray-300 rounded"
            style={{ backgroundColor: value || "#000000" }}
          />
          <span>{value || ""}</span>
        </div>
      ) : (
        formatValue(value, column.id)
      )}
    </div>
  );
};
