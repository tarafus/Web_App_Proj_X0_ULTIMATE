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
    api.post<string>(`/auth/register?username=${data.username}&password=${data.password}`),

  login: (data: LoginRequest) =>
    api.post<string>(`/auth/login?username=${data.username}&password=${data.password}`),

  me: (token: string) =>
    api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
