export type PatientInput = {
  patient_no: string;
  name: string;
  dob: string;
  sex: string;
  contact: string;
  address: string;
};

export type VisitInput = {
  doctor_id: string;
  complaint: string;
  diagnosis?: string;
  notes?: string;
};

export type PrescriptionInput = {
  drug: string;
  dosage: string;
};

export type LabRequestInput = {
  test_name: string;
};
