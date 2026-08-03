import {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    User,
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
        phone: credentials.phone,
        password: credentials.password,
    });

    return { user: data.user, token: data.token };
};

export const logout = async (): Promise<void> => {
    // No backend logout endpoint (stateless JWT) — clearing the store is enough.
};

export const updateBankDetails = async (details: {
    name: string;
    accountNumber: string;
    bankCode: string;
}): Promise<{ message: string; recipientCode: string; user: User }> => {
    const { data } = await api.post("/users/bank-details", details);
    return data;
};

/** Submits account verification details (Ghana Card, Passport, etc.). */
export const verifyAccount = async (details: {
    idType: string;
    idNumber: string;
}): Promise<{ message: string; user: User }> => {
    const { data } = await api.post("/users/verify-account", details);
    return data;
};

/** Requests access/approval for Rider or Post role. */
export const requestRoleApproval = async (
    role: "rider" | "post"
): Promise<{ message: string; user: User }> => {
    const { data } = await api.post("/users/request-role", { role });
    return data;
};

/** Sends a 6-digit OTP to the given email or phone. Call before account creation. */
export const sendSignupOtp = async (email: string): Promise<void> => {
    await api.post("/auth/otp/send", { email });
};

/** Verifies the OTP entered by the user. Throws if invalid/expired. */
export const verifySignupOtp = async (email: string, otp: string): Promise<void> => {
    await api.post("/auth/otp/verify", { email, otp });
};
