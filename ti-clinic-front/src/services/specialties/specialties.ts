import { Specialty } from "@/types/specialty";
import { api } from "../api";

export async function getSpecialtiesRequest(): Promise<Specialty[]> {
  const response = await api.get("/specialties");
  return response.data;
}

export async function createSpecialtyRequest(
  specialty: Specialty
): Promise<void> {
  const response = await api.post("/specialties", specialty);
  return response.data;
}

export async function deleteSpecialtyRequest(id: string): Promise<void> {
  const response = await api.delete(`/specialties/${id}`);
  return response.data;
}

export async function updateSpecialtyRequest(
  id: string,
  specialty: Specialty
): Promise<void> {
  const response = await api.patch(`/specialties/${id}`, specialty);
  return response.data;
}
