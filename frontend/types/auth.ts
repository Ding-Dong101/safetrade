export interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    isAdmin: boolean;
    createdAt: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterCredentials {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export type Role = "buyer" | "seller" | "rider" | "post";