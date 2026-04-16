import { Procedure } from "@/types/procedures";
import { api } from "../api";

export async function getProceduresRequest(): Promise<Procedure[]> {
  const response = await api.get("/procedures");
  return response.data;
}

export async function createSpecialtyRequest(
  procedure: Procedure
): Promise<void> {
  const response = await api.post("/procedures", procedure);
  return response.data;
}

export async function deleteSpecialtyRequest(id: string): Promise<void> {
  const response = await api.delete(`/procedures/${id}`);
  return response.data;
}

export async function updateSpecialtyRequest(
  id: string,
  procedure: Procedure
): Promise<void> {
  const response = await api.patch(`/procedures/${id}`, procedure);
  return response.data;
}
