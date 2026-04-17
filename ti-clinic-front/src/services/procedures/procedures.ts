import { Procedure, ProcedureMutationBody } from "@/types/procedures";
import { api } from "../api";

export async function getProceduresRequest(): Promise<Procedure[]> {
  const response = await api.get("/procedures");
  return response.data;
}

export async function createProcedureRequest(
  body: ProcedureMutationBody
): Promise<void> {
  const response = await api.post("/procedures", body);
  return response.data;
}

export async function deleteProcedureRequest(id: string): Promise<void> {
  const response = await api.delete(`/procedures/${id}`);
  return response.data;
}

export async function updateProcedureRequest(
  id: string,
  body: ProcedureMutationBody
): Promise<void> {
  const response = await api.patch(`/procedures/${id}`, body);
  return response.data;
}
