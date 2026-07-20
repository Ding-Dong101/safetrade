import {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
} from "@/types/auth";
import api from "@/services/api";

// Real auth service backed by the Spring Boot API (/api/users).
// Backend returns: { token, userId, name, user: { id, firstName, lastName, username, email, isAdmin, balance, createdAt } }

export const login = async (
    credentials: LoginCredentials
): Promise<AuthResponse> => {
    const { data } = await api.post("/users/login", {
        username: credentials.username,
        password: credentials.password,
    });

    return { user: data.user, token: data.token };
};

export const register = async (
    credentials: RegisterCredentials
): Promise<AuthResponse> => {
    // Backend Users entity uses lowercase field names (firstname/lastname).
    const { data } = await api.post("/users/register", {
        username: credentials.username,
        firstname: credentials.firstName,
        lastname: credentials.lastName,
        email: credentials.email,
        password: credentials.password,
    });

    return { user: data.user, token: data.token };
};

export const logout = async (): Promise<void> => {
    // No backend logout endpoint (stateless JWT) — clearing the store is enough.
};
