import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import GenericTable, { EditableCell } from "./components/table/GenericTable";
import type { Sample, Donor } from "./types";
import "./index.css";

// Sample data
const samplesData: Sample[] = [
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

// Donors data
const donorsData: Donor[] = [
  {
    id: "donor-001",
    firstName: "John",
    lastName: "Smith",
    donorId: "D001",
    age: 45,
    sex: "Male",
  },
  {
    id: "donor-002",
    firstName: "Sarah",
    lastName: "Johnson",
    donorId: "D002",
    age: 32,
    sex: "Female",
  },
  {
    id: "donor-003",
    firstName: "Michael",
    lastName: "Brown",
    donorId: "D003",
    age: 58,
    sex: "Male",
  },
  {
    id: "donor-004",
    firstName: "Emily",
    lastName: "Davis",
    donorId: "D004",
    age: 29,
    sex: "Female",
  },
  {
    id: "donor-005",
    firstName: "Robert",
    lastName: "Wilson",
    donorId: "D005",
    age: 67,
    sex: "Male",
  },
];

// Column helpers
const sampleColumnHelper = createColumnHelper<Sample>();
const donorColumnHelper = createColumnHelper<Donor>();

// Sample columns with different input types
const sampleColumns = [
  sampleColumnHelper.accessor("sampleId", {
    header: "Sample ID",
    cell: (props) => <EditableCell {...props} inputType="text" placeholder="Enter sample ID" />,
  }),
  sampleColumnHelper.accessor("donorId", {
    header: "Donor ID",
    cell: (props) => <EditableCell {...props} inputType="text" placeholder="Enter donor ID" />,
  }),
  sampleColumnHelper.accessor("gender", {
    header: "Gender",
    cell: (props) => (
      <EditableCell 
        {...props} 
        inputType="select" 
        selectOptions={[
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
          { value: "Other", label: "Other" },
          { value: "Not Specified", label: "Not Specified" }
        ]}
      />
    ),
  }),
  sampleColumnHelper.accessor("assaysPerformed", {
    header: "Assays",
    cell: (props) => <EditableCell {...props} disabled />,
    enableEditing: false,
  }),
  sampleColumnHelper.accessor("isPooled", {
    header: "Pooled",
    cell: (props) => <EditableCell {...props} inputType="checkbox" />,
  }),
  sampleColumnHelper.accessor("collectionDate", {
    header: "Collection Date",
    cell: (props) => <EditableCell {...props} inputType="date" />,
  }),
  sampleColumnHelper.accessor("sampleType", {
    header: "Sample Type",
    cell: (props) => (
      <EditableCell 
        {...props} 
        inputType="select"
        selectOptions={[
          { value: "Blood", label: "Blood" },
          { value: "Tissue", label: "Tissue" },
          { value: "Saliva", label: "Saliva" },
          { value: "Urine", label: "Urine" },
          { value: "Other", label: "Other" }
        ]}
      />
    ),
  }),
  sampleColumnHelper.accessor("status", {
    header: "Status",
    cell: (props) => (
      <EditableCell 
        {...props} 
        inputType="select"
        selectOptions={[
          { value: "Received", label: "Received" },
          { value: "Processing", label: "Processing" },
          { value: "Running Analysis", label: "Running Analysis" },
          { value: "Complete", label: "Complete" },
          { value: "Processing Error", label: "Processing Error" },
          { value: "On Hold", label: "On Hold" }
        ]}
      />
    ),
  }),
  sampleColumnHelper.accessor("tissueOrigin", {
    header: "Tissue Origin",
    cell: (props) => (
      <EditableCell 
        {...props} 
        inputType="select"
        selectOptions={[
          { value: "Breast", label: "Breast" },
          { value: "Lung", label: "Lung" },
          { value: "Liver", label: "Liver" },
          { value: "Brain", label: "Brain" },
          { value: "Kidney", label: "Kidney" },
          { value: "Other", label: "Other" }
        ]}
      />
    ),
  }),
  sampleColumnHelper.accessor("processingPriority", {
    header: "Priority",
    cell: (props) => (
      <EditableCell 
        {...props} 
        inputType="select"
        selectOptions={[
          { value: "STAT", label: "STAT" },
          { value: "High", label: "High" },
          { value: "Normal", label: "Normal" },
          { value: "Low", label: "Low" }
        ]}
      />
    ),
  }),
  sampleColumnHelper.accessor("totalReadCount", {
    header: "Read Count",
    cell: (props) => (
      <EditableCell 
        {...props} 
        inputType="number" 
        min="0" 
        step="1" 
        placeholder="0"
      />
    ),
  }),
  sampleColumnHelper.accessor("projectId", {
    header: "Project ID",
    cell: (props) => <EditableCell {...props} inputType="text" placeholder="OS-P-XXXX" />,
  }),
];

// Donor columns with different input types
const donorColumns = [
  donorColumnHelper.accessor("firstName", {
    header: "First Name",
    cell: (props) => <EditableCell {...props} inputType="text" placeholder="Enter first name" />,
  }),
  donorColumnHelper.accessor("lastName", {
    header: "Last Name",
    cell: (props) => <EditableCell {...props} inputType="text" placeholder="Enter last name" />,
  }),
  donorColumnHelper.accessor("donorId", {
    header: "Donor ID",
    cell: (props) => <EditableCell {...props} inputType="text" placeholder="D001" />,
  }),
  donorColumnHelper.accessor("age", {
    header: "Age",
    cell: (props) => (
      <EditableCell 
        {...props} 
        inputType="number" 
        min="0" 
        max="120" 
        step="1" 
        placeholder="Age"
      />
    ),
  }),
  donorColumnHelper.accessor("sex", {
    header: "Sex",
    cell: (props) => (
      <EditableCell 
        {...props} 
        inputType="select"
        selectOptions={[
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
          { value: "Other", label: "Other" }
        ]}
      />
    ),
  }),
];

// Empty row creators
const createEmptySample = (): Sample => ({
  id: `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  sampleId: "",
  donorId: "",
  gender: "",
  assaysPerformed: [],
  isPooled: false,
  collectionDate: "",
  sampleType: "",
  status: "",
  tissueOrigin: "",
  processingPriority: "",
  lastUpdated: new Date().toISOString(),
  totalReadCount: 0,
  projectId: "",
});

const createEmptyDonor = (): Donor => ({
  id: `donor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  firstName: "",
  lastName: "",
  donorId: "",
  age: 0,
  sex: "Other",
});

// Custom formatters
const sampleFormatValue = (val: any, columnId: string): string => {
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
  return val.toString();
};

const sampleParseValue = (value: any, columnId: string, originalValue: any): any => {
  // Handle boolean values (for checkboxes)
  if (columnId === "isPooled") {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      const lowerValue = value.trim().toLowerCase();
      return lowerValue === "yes" || lowerValue === "true" || lowerValue === "1";
    }
    return Boolean(value);
  }
  
  // Handle number values
  if (columnId === "totalReadCount") {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const num = parseInt(value.replace(/,/g, ""), 10);
      return !isNaN(num) ? num : originalValue;
    }
    return originalValue;
  }
  
  // Handle date values
  if (columnId === "collectionDate" || columnId === "lastUpdated") {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === "string" && value) {
      const d = new Date(value);
      return !isNaN(d.getTime()) ? d.toISOString() : value;
    }
    return value;
  }
  
  return value;
};

const donorParseValue = (value: string, columnId: string, originalValue: any): any => {
  if (columnId === "age") {
    const num = parseInt(value, 10);
    return !isNaN(num) ? num : originalValue;
  }
  return value;
};

function App() {
  const [currentView, setCurrentView] = useState<"samples" | "donors">("samples");
  const [samples, setSamples] = useState<Sample[]>(samplesData);
  const [donors, setDonors] = useState<Donor[]>(donorsData);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Excel-like Table Component Demo
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView("samples")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentView === "samples"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Samples Table
            </button>
            <button
              onClick={() => setCurrentView("donors")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentView === "donors"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Donors Table
            </button>
          </div>
        </div>

        {currentView === "samples" ? (
          <GenericTable<Sample>
            data={samples}
            columns={sampleColumns}
            title="Samples Table"
            onDataChange={setSamples}
            createEmptyRow={createEmptySample}
            formatValue={sampleFormatValue}
            parseValue={sampleParseValue}
          />
        ) : (
          <GenericTable<Donor>
            data={donors}
            columns={donorColumns}
            title="Donors Table"
            onDataChange={setDonors}
            createEmptyRow={createEmptyDonor}
            parseValue={donorParseValue}
          />
        )}
      </div>
    </div>
  );
}

export default App;
