export interface Sample {
  id: string;
  sampleId: string;
  donorId: string;
  gender: string;
  assaysPerformed: Array<{
    id: string;
    name: string;
    type: string;
    date: string;
    status: string;
  }>;
  isPooled: boolean;
  collectionDate: string;
  sampleType: string;
  status: string;
  tissueOrigin: string;
  processingPriority: string;
  lastUpdated: string;
  totalReadCount: number;
  projectId: string;
}

export interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  donorId: string;
  age: number;
  sex: "Male" | "Female" | "Other";
}
