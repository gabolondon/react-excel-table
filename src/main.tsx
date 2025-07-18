import React from 'react'
import ReactDOM from "react-dom/client";
import "./index.css";
import Table from "./components/table/Table.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="container py-10 mx-auto">
      <Table />
    </div>
  </React.StrictMode>
);

