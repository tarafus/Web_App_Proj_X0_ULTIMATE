import { api } from "./api.ts";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<string>("/auth/register", data),

  login: (data: LoginRequest) =>
    api.post<string>("/auth/login", data),

  me: (token: string) =>
    api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};