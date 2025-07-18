import React from 'react'
import ReactDOM from 'react-dom/client'
import { DataTable } from './components/table/data-table.tsx'
import { columns, data } from './components/table/columns.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  </React.StrictMode>,
)