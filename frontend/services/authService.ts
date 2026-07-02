import api from "./api";
import { AuthResponse, LoginCredentials, RegisterCredentials } from "@/types/auth";

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const payload = {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        firstname: credentials.firstName,
        lastname: credentials.lastName,
        phone: credentials.phone
    };
    const response = await api.post("/auth/register", payload);
    return response.data;
};

export const logout = async (): Promise<void> => {
    await api.post("/auth/logout");
};

export const refreshToken = async (token: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/refresh", { token });
    return response.data;
};

export const getUserByUsername = async (username: string): Promise<any> => {
    const response = await api.get(`/users/get/username/${username}`);
    return response.data;
};

export const topUpWallet = async (amount: number): Promise<any> => {
    const response = await api.post("/users/topup", { amount });
    return response.data;
};