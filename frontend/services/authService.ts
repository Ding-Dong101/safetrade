import {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    User,
} from "@/types/auth";
import { MOCK_USER } from "@/constants/data";

// Mock auth service — replace with real API calls (see services/api.ts) when the
// backend endpoints are wired up.

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildUser = (username: string, overrides: Partial<User> = {}): User => ({
    id: "user-001",
    firstName: MOCK_USER.name,
    lastName: "Mensah",
    username,
    email: MOCK_USER.email,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    balance: MOCK_USER.availableBalance,
    ...overrides,
});

export const login = async (
    credentials: LoginCredentials
): Promise<AuthResponse> => {
    await delay(600);

    if (!credentials.username || !credentials.password) {
        throw new Error("Username and password are required");
    }

    return {
        user: buildUser(credentials.username),
        token: "mock-jwt-token",
    };
};

export const register = async (
    credentials: RegisterCredentials
): Promise<AuthResponse> => {
    await delay(800);

    if (!credentials.username || !credentials.password) {
        throw new Error("Username and password are required");
    }

    return {
        user: buildUser(credentials.username, {
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            email: credentials.email,
            phone: credentials.phone,
        }),
        token: "mock-jwt-token",
    };
};

export const logout = async (): Promise<void> => {
    await delay(200);
};
