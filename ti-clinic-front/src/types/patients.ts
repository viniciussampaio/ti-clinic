export interface PatientForm {
  name: string;
  cpf: string;
  phone: string;
  birthDate?: string;
  healthPlanEnrollment?: {
    healthPlanId: number;
    contractNumber: string;
  } | null;
}

export interface PatientHealthPlan {
  id: number;
  description: string;
  phone: string;
}

export interface PatientPlan {
  id: number;
  healthPlan: PatientHealthPlan;
  contractNumber: string;
}

export interface CurrentHealthPlan {
  enrollmentId: number;
  healthPlanId: number;
  description: string;
  phone: string;
  contractNumber: string;
}

export interface PatientFromApi {
  id: number;
  name: string;
  cpf?: string | null;
  birthDate: string;
  phone: string | null;
  patientPlans: PatientPlan[];
  currentHealthPlan: CurrentHealthPlan | null;
}

export interface RegisteredPatient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  birthDate: string;
  patientPlans: PatientPlan[];
  currentHealthPlan: CurrentHealthPlan | null;
}
