import { Doctor } from "./doctors";
import { HealthPlan } from "./health-plans";
import { Procedure } from "./procedures";
import { Specialty } from "./specialty";

export interface AppointmentPayload {
  appointmentDate: string;
  appointmentTime: string;
  patientId: number;
  doctorId: number;
  specialtyId: number;
  patientPlanId: number;
  isPrivatePay: boolean;
  procedureIds: number[];
}

export interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  isPrivatePay: boolean;
  patient: Patient;
  doctor: Doctor;
  specialty: Specialty;
  patientPlan: PatientPlan | null;
  procedures: Procedure[];
}

export interface Patient {
  id: number;
  name: string;
  cpf: string | null;
  birthDate: string;
  phone: string | null;
}

export interface PatientPlan {
  id: number;
  healthPlan: HealthPlan;
  contractNumber: string;
}

export interface UpdateConsultationPayload {
  appointmentDate: string;
  appointmentTime: string;
  isPrivatePay: boolean;
  procedureIds: number[];
}
