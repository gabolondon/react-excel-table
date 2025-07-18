import React, { useState, useEffect } from 'react';

interface EditableCellProps {
  value: any;
  row: any;
  column: any;
  updateData: (rowIndex: number, columnId: string, value: any) => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({ value: initialValue, row, column, updateData }) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const onBlur = () => {
    setIsEditing(false);
    updateData(row.index, column.id, value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.currentTarget.blur();
    }
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return isEditing ? (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      autoFocus
    />
  ) : (
    <div onClick={() => setIsEditing(true)} style={{ width: '100%', height: '100%' }}>
      {value}
    </div>
  );
};
