import { api } from "../api";

export interface LoginResult {
  token: string;
  user: Record<string, unknown> | null;
}

function parseLoginPayload(body: unknown): LoginResult {
  const root =
    body &&
    typeof body === "object" &&
    "data" in body &&
    (body as { data: unknown }).data !== undefined
      ? (body as { data: unknown }).data
      : body;

  if (!root || typeof root !== "object") {
    throw new Error("Resposta inválida do servidor.");
  }

  const record = root as Record<string, unknown>;
  const tokenRaw = record.token ?? record.access_token ?? record.accessToken;

  if (typeof tokenRaw !== "string" || !tokenRaw) {
    throw new Error(
      "Token não encontrado na resposta. Verifique o contrato do backend (token, access_token ou accessToken)."
    );
  }

  const userRaw = record.user;
  const user =
    userRaw && typeof userRaw === "object"
      ? (userRaw as Record<string, unknown>)
      : null;

  return { token: tokenRaw, user };
}

export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResult> {
  const { data } = await api.post("/login", { email, password });
  return parseLoginPayload(data);
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export async function registerRequest(
  payload: RegisterPayload
): Promise<LoginResult | null> {
  const { data } = await api.post("/login/register", payload);
  try {
    return parseLoginPayload(data);
  } catch {
    return null;
  }
}
