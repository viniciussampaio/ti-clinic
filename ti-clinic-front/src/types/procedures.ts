export interface Procedure {
  id: number;
  name: string;
  price: string;
}

/** Corpo de criação/atualização: sem `id` (o id vai na URL no PATCH). */
export type ProcedureMutationBody = {
  name: string;
  price: number;
};
