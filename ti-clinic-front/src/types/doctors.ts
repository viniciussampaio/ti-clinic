import { Specialty } from "./specialty";

export interface Doctor {
  id?: string;
  name: string;
  crm: string;
  specialty: Specialty;
}
