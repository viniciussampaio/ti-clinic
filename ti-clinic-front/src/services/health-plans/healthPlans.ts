import { HealthPlan, HealthPlanForm } from "@/types/health-plans";
import { api } from "../api";

export async function getHealthPlansRequest(): Promise<HealthPlan[]> {
  const response = await api.get("/health-plans");
  return response.data;
}

export async function createHealthPlanRequest(
  healthPlan: HealthPlanForm
): Promise<void> {
  const response = await api.post("/health-plans", healthPlan);
  return response.data;
}

export async function deleteHealthPlanRequest(id: string): Promise<void> {
  const response = await api.delete(`/health-plans/${id}`);
  return response.data;
}
