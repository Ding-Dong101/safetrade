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
    balance?: number;
    paymentName?: string;
    paymentNumber?: string;
    paymentNetwork?: string;
    isVerified?: boolean;
    idType?: string;
    idNumber?: string;
    isSellerApproved?: boolean;
    isRiderApproved?: boolean;
    isPostApproved?: boolean;
    sellerCode?: string;
    riderCode?: string;
    postCode?: string;
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
    optedRole?: "buyer" | "seller" | "rider" | "both";
    isSellerApproved?: boolean;
    isRiderApproved?: boolean;
    sellerCode?: string;
    riderCode?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export type Role = "buyer" | "seller" | "rider" | "post";