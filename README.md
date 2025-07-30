# React Excel-like Table Component

A powerful, reusable React table component that mimics Excel spreadsheet functionality with TypeScript support. Built with TanStack Table, Tailwind CSS, and Radix UI.

## Features

✅ **Excel-like Functionality**
- Cell editing with double-click or Enter key
- Row and cell selection (single, multi, range)  
- Copy/paste support (Ctrl+C/Ctrl+V)
- Keyboard navigation with arrow keys
- Row manipulation (add, insert, delete)

✅ **Developer Experience**
- Fully TypeScript typed with generics
- Reusable component for any data type
- Customizable formatting and parsing
- Excel-like toolbar with icons
- Row selectors (click row numbers)

✅ **UI/UX**
- Professional spreadsheet appearance
- Hover effects and visual feedback
- Responsive design
- Accessible keyboard shortcuts

## Demo

The application includes two example tables:
- **Samples Table**: Complex biological sample data with various data types
- **Donors Table**: Simple donor information with basic fields

Switch between tables using the buttons at the top of the page.

## Usage

### Basic Implementation

```tsx
import GenericTable, { EditableCell } from './components/table/GenericTable';
import { createColumnHelper } from '@tanstack/react-table';

// Define your data type
interface MyData {
  id: string;
  name: string;
  age: number;
  active: boolean;
}

// Sample data
const data: MyData[] = [
  { id: '1', name: 'John', age: 30, active: true },
  // ... more data
];

// Create column helper
const columnHelper = createColumnHelper<MyData>();

// Define columns
const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: EditableCell,
  }),
  columnHelper.accessor('age', {
    header: 'Age', 
    cell: EditableCell,
  }),
  columnHelper.accessor('active', {
    header: 'Active',
    cell: EditableCell,
  }),
];

// Create empty row function
const createEmptyRow = (): MyData => ({
  id: `new-${Date.now()}`,
  name: '',
  age: 0,
  active: false,
});

// Use the table
function MyComponent() {
  const [tableData, setTableData] = useState<MyData[]>(data);

  return (
    <GenericTable<MyData>
      data={tableData}
      columns={columns}
      title="My Data Table"
      onDataChange={setTableData}
      createEmptyRow={createEmptyRow}
    />
  );
}
```

### Advanced Configuration

```tsx
// Custom formatting function
const customFormatValue = (val: any, columnId: string): string => {
  if (columnId === 'active') {
    return val ? 'Yes' : 'No';
  }
  if (columnId === 'age') {
    return `${val} years old`;
  }
  return val?.toString() || '';
};

// Custom parsing function  
const customParseValue = (value: string, columnId: string, originalValue: any): any => {
  if (columnId === 'active') {
    return value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
  }
  if (columnId === 'age') {
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return !isNaN(num) ? num : originalValue;
  }
  return value;
};

// Use with custom formatters
<GenericTable<MyData>
  data={tableData}
  columns={columns}
  title="My Data Table"
  onDataChange={setTableData}
  createEmptyRow={createEmptyRow}
  formatValue={customFormatValue}
  parseValue={customParseValue}
/>
```

## Component Props

### GenericTable<T>

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `T[]` | ✅ | Array of data objects |
| `columns` | `ColumnDef<T, any>[]` | ✅ | TanStack Table column definitions |
| `title` | `string` | ✅ | Table title displayed above toolbar |
| `onDataChange` | `(data: T[]) => void` | ❌ | Callback when data changes |
| `createEmptyRow` | `() => T` | ✅ | Function to create new empty row |
| `formatValue` | `(value: any, columnId: string) => string` | ❌ | Custom cell display formatting |
| `parseValue` | `(value: string, columnId: string, originalValue: any) => any` | ❌ | Custom value parsing on edit |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Double-click** | Edit cell |
| **Enter** | Start editing active cell |
| **Escape** | Cancel editing |
| **Tab** | Move to next cell (with editing) |
| **Shift + Tab** | Move to previous cell |
| **Arrow Keys** | Navigate between cells |
| **Shift + Arrow Keys** | Extend selection |
| **Ctrl/Cmd + C** | Copy selected cells |
| **Ctrl/Cmd + V** | Paste from clipboard |
| **Ctrl/Cmd + Click** | Multi-select cells |
| **Shift + Click** | Range select cells |

## Toolbar Features

- **Add Row**: Append new row at bottom
- **Insert Above**: Insert row above selected rows
- **Insert Below**: Insert row below selected rows  
- **Delete Rows**: Remove selected rows
- **Copy**: Copy selected cells to clipboard
- **Paste**: Paste from clipboard to selected cell

## Row Selection

- Click row numbers (left column) to select entire rows
- Use Ctrl/Cmd + Click for multi-row selection
- Use Shift + Click for range row selection
- Selected rows are highlighted in blue

## Data Types Support

The component automatically handles common data types:

- **Strings**: Direct editing
- **Numbers**: Formatted with thousands separators, parsed back to numbers
- **Booleans**: Displayed as "Yes"/"No", accepts various true/false inputs
- **Dates**: Formatted using `toLocaleDateString()`, parsed as ISO strings
- **Arrays**: Shows count (e.g., "3 items"), non-editable by default

## Customization

### Custom Cell Formatting

Override the `formatValue` prop to customize how different data types are displayed:

```tsx
const formatValue = (val: any, columnId: string): string => {
  // Your custom formatting logic
  return formattedValue;
};
```

### Custom Value Parsing

Override the `parseValue` prop to customize how edited values are converted back to your data types:

```tsx
const parseValue = (value: string, columnId: string, originalValue: any): any => {
  // Your custom parsing logic
  return parsedValue;
};
```

### Non-editable Columns

Mark columns as non-editable in the column definition:

```tsx
columnHelper.accessor('computedField', {
  header: 'Computed',
  cell: EditableCell,
  enableEditing: false, // This column cannot be edited
})
```

## Development

```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build
```

## Dependencies

- React 19+
- @tanstack/react-table
- Tailwind CSS 
- Radix UI components
- Lucide React icons
- TypeScript

## License

MIT License - feel free to use in your projects!
