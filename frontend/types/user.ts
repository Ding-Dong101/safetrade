import { Role } from "./auth";

export interface UserProfile {
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

export interface UserBalance {
    available: number;
    total: number;
    currency: string;
}

export interface UserStats {
    activeDeals: number;
    totalReviews: number;
    completedTrades: number;
    successRate: number;
}

export interface Review {
    id: string;
    reviewerId: string;
    reviewerName: string;
    revieweeId: string;
    rating: number;
    comment?: string;
    tradeId: string;
    createdAt: string;
}

export interface RoleState {
    activeRole: Role;
}