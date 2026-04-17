export type RegisterResult = {
  id: number;
  email: string;
  displayName: string | null;
};

/** Dados públicos do usuário devolvidos junto ao token no login. */
export type AuthUser = {
  id: number;
  email: string;
  displayName: string | null;
};

export type LoginTokenResult = {
  access_token: string;
  user: AuthUser;
};
