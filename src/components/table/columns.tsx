"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type SampleIntakeForm = {
  id: string;
  externalSampleId: string;
  osDonorId: string;
  osSampleId: string | null;
  cohortId: string; 
  sampleTypeAtArrival: string | null;
  patientConsentInfo: string | null;
  age: number | null;
  sex: "Male" | "Female" | "Not Available" | null;
  sampleReceivedDate: Date | null;
  samplingDate: Date | null;
  timepointId: string;
  assayRequested: string | null;
  comments: string | null;
};

export let data: SampleIntakeForm[] = [
  {
    id: "1",
    externalSampleId: "EXT001",
    osDonorId: "DONOR001",
    osSampleId: "SAMPLE001",
    cohortId: "COHORT01",
    sampleTypeAtArrival: "Blood",
    patientConsentInfo: "Consent on file",
    age: 35,
    sex: "Male",
    sampleReceivedDate: new Date("2023-01-15"),
    samplingDate: new Date("2023-01-14"),
    timepointId: "T1",
    assayRequested: "Assay A",
    comments: "No comments",
  },
  {
    id: "2",
    externalSampleId: "EXT002",
    osDonorId: "DONOR002",
    osSampleId: "SAMPLE002",
    cohortId: "COHORT02",
    sampleTypeAtArrival: "Tissue",
    patientConsentInfo: "Consent on file",
    age: 45,
    sex: "Female",
    sampleReceivedDate: new Date("2023-02-20"),
    samplingDate: new Date("2023-02-19"),
    timepointId: "T2",
    assayRequested: "Assay B",
    comments: "Urgent",
  },
  {
    id: "3",
    externalSampleId: "EXT003",
    osDonorId: "DONOR003",
    osSampleId: "SAMPLE003",
    cohortId: "COHORT01",
    sampleTypeAtArrival: "Saliva",
    patientConsentInfo: "No consent",
    age: 28,
    sex: "Male",
    sampleReceivedDate: new Date("2023-03-10"),
    samplingDate: new Date("2023-03-09"),
    timepointId: "T1",
    assayRequested: "Assay C",
    comments: "N/A",
  },
  {
    id: "4",
    externalSampleId: "EXT004",
    osDonorId: "DONOR004",
    osSampleId: "SAMPLE004",
    cohortId: "COHORT03",
    sampleTypeAtArrival: "Blood",
    patientConsentInfo: "Consent on file",
    age: 52,
    sex: "Female",
    sampleReceivedDate: new Date("2023-04-05"),
    samplingDate: new Date("2023-04-04"),
    timepointId: "T3",
    assayRequested: "Assay A",
    comments: "Fragile sample",
  },
  {
    id: "5",
    externalSampleId: "EXT005",
    osDonorId: "DONOR005",
    osSampleId: "SAMPLE005",
    cohortId: "COHORT02",
    sampleTypeAtArrival: "Urine",
    patientConsentInfo: "Consent on file",
    age: 60,
    sex: "Male",
    sampleReceivedDate: new Date("2023-05-12"),
    samplingDate: new Date("2023-05-11"),
    timepointId: "T2",
    assayRequested: "Assay B",
    comments: "",
  },
];

import { EditableCell } from './editable-cell';
import { SortableHeader } from "./sortable-header";

const updateData = (rowIndex: number, columnId: string, value: any) => {
  data = data.map((row, index) => {
    if (index === rowIndex) {
      return { ...row, [columnId]: value };
    }
    return row;
  });
};


export const columns: ColumnDef<SampleIntakeForm>[] = [
  {
    accessorKey: "osDonorId",
    header: ({ column }) => (
      <SortableHeader column={column}>Donor ID</SortableHeader>
    ),
    cell: (cellInfo) => EditableCell({
      value: cellInfo.getValue(),
      row: cellInfo.row,
      column: cellInfo.column,
      updateData
    }),
  },
  {
    accessorKey: "externalSampleId",
    header: ({ column }) => (
      <SortableHeader column={column}>External Sample ID</SortableHeader>
    ),
    cell: (cellInfo) => EditableCell({
      value: cellInfo.getValue(),
      row: cellInfo.row,
      column: cellInfo.column,
      updateData
    }),
  },
  {
    accessorKey: "cohortId",
    header: ({ column }) => (
      <SortableHeader column={column}>Cohort</SortableHeader>
    ),
    cell: (cellInfo) => EditableCell({
      value: cellInfo.getValue(),
      row: cellInfo.row,
      column: cellInfo.column,
      updateData
    }),
  },
  {
    accessorKey: "sex",
    header: ({ column }) => (
      <SortableHeader column={column}>Sex</SortableHeader>
    ),
    cell: (cellInfo) => EditableCell({
      value: cellInfo.getValue(),
      row: cellInfo.row,
      column: cellInfo.column,
      updateData
    }),
  },
  {
    accessorKey: "age",
    header: ({ column }) => (
      <SortableHeader column={column}>Age</SortableHeader>
    ),
    cell: (cellInfo) => EditableCell({
      value: cellInfo.getValue(),
      row: cellInfo.row,
      column: cellInfo.column,
      updateData
    }),
  },
  {
    accessorKey: "sampleTypeAtArrival",
    header: ({ column }) => (
      <SortableHeader column={column}>Sample Type</SortableHeader>
    ),
    cell: (cellInfo) => EditableCell({
      value: cellInfo.getValue(),
      row: cellInfo.row,
      column: cellInfo.column,
      updateData
    }),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sample = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-8 h-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(sample.id)}
            >
              Copy sample ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];