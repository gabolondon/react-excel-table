export type SampleIntakeForm = {
  id: string;
  externalSampleId: string;
  osDonorId: string;
  osSampleId: string | null;
  cohortId: string; //this should be from a cohorts list(create donors modal)
  // principalInvestigator: string | null;
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
