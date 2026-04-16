import { api } from "../api";
import { Doctor } from "@/types/doctors";

export async function getDoctorsRequest(): Promise<Doctor[]> {
  const response = await api.get("/doctors");
  return response.data;
}

export async function createDoctorRequest(doctor: Doctor): Promise<void> {
  const response = await api.post("/doctors", doctor);
  return response.data;
}

export async function deleteDoctorRequest(id: string): Promise<void> {
  const response = await api.delete(`/doctors/${id}`);
  return response.data;
}

export async function updateDoctorRequest(
  id: string,
  doctor: Doctor
): Promise<void> {
  const response = await api.patch(`/doctors/${id}`, doctor);
  return response.data;
}
