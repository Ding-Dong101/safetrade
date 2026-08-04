import {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    User,
    Role,
} from "@/types/auth";
import api from "@/services/api";

// Real auth service backed by the Spring Boot API (/api/users).
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
    // Generate role activation codes if opted in
    const isSeller = credentials.optedRole === "seller" || credentials.optedRole === "both";
    const isRider = credentials.optedRole === "rider" || credentials.optedRole === "both";

    const rand1 = Math.floor(1000 + Math.random() * 9000);
    const rand2 = Math.floor(1000 + Math.random() * 9000);
    const sellerCode = isSeller ? `SEL-${rand1}` : undefined;
    const riderCode = isRider ? `RDR-${rand2}` : undefined;

    const { data } = await api.post("/users/register", {
        username: credentials.username,
        firstname: credentials.firstName,
        lastname: credentials.lastName,
        email: credentials.email,
        phone: credentials.phone,
        password: credentials.password,
        isSellerApproved: isSeller,
        isRiderApproved: isRider,
        sellerCode,
        riderCode,
    });

    // Ensure frontend User object retains the assigned codes
    const user: User = {
        ...data.user,
        isSellerApproved: isSeller || data.user?.isSellerApproved,
        isRiderApproved: isRider || data.user?.isRiderApproved,
        sellerCode: data.user?.sellerCode || sellerCode,
        riderCode: data.user?.riderCode || riderCode,
    };

    return { user, token: data.token };
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

/** Unlocks a portal role (seller, rider, post) using an authorization code. */
export const unlockRoleWithCode = async (
    role: "seller" | "rider" | "post",
    code: string
): Promise<{ message: string; user: User }> => {
    const { data } = await api.post("/users/unlock-role", { role, code });
    return data;
};

/** Requests access/approval for a role. */
export const requestRoleApproval = async (
    role: "seller" | "rider" | "post"
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
