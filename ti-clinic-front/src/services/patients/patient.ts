import { PatientForm, PatientFromApi } from "@/types/patients";
import { api } from "../api";

export async function registerPatientRequest(
  patient: PatientForm
): Promise<void> {
  const response = await api.post("/patients/create", patient);
  return response.data;
}

export async function getPatientsRequest(): Promise<PatientFromApi[]> {
  const response = await api.get("/patients/list-patients");
  return response.data;
}

export async function deletePatientRequest(id: string): Promise<void> {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
}

export async function updatePatientRequest(
  id: string,
  patient: PatientForm
): Promise<void> {
  const response = await api.patch(`/patients/${id}`, patient);
  return response.data;
}

export async function getPatientByCpfRequest(
  cpfDigits: string
): Promise<PatientFromApi> {
  const response = await api.get(`/patients/by-cpf/${cpfDigits}`);
  return response.data;
}
