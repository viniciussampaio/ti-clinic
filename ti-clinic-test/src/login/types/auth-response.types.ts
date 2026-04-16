export type RegisterResult = {
  id: number;
  email: string;
  displayName: string | null;
};

export type LoginTokenResult = {
  access_token: string;
};
