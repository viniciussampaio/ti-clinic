import {
  Appointment,
  AppointmentPayload,
  UpdateConsultationPayload,
} from "@/types/consultations";
import { api } from "../api";

export async function getConsultationsRequest(): Promise<Appointment[]> {
  const response = await api.get("/consultations");
  return response.data;
}

export async function createConsultationRequest(
  consultation: AppointmentPayload
): Promise<void> {
  const response = await api.post("/consultations", consultation);
  return response.data;
}

export async function deleteConsultationRequest(id: number): Promise<void> {
  const response = await api.delete(`/consultations/${id}`);
  return response.data;
}

export async function updateConsultationRequest(
  id: number,
  consultation: UpdateConsultationPayload
): Promise<void> {
  const response = await api.patch(`/consultations/${id}`, consultation);
  return response.data;
}
