import api from "./api";
import { AuthResponse, LoginCredentials, RegisterCredentials } from "@/types/auth";

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", credentials);
    return response.data;
};

export const logout = async (): Promise<void> => {
    await api.post("/auth/logout");
};

export const refreshToken = async (token: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/refresh", { token });
    return response.data;
};