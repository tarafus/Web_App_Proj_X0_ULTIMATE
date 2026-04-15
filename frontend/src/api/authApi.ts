import { api } from "./api";

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}

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
    api.post<AuthResponse>("/auth/register", data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data),
};