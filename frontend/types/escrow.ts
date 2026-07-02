export type EscrowStatus =
    | "pending"
    | "funds_deposited"
    | "delivered"
    | "disputed"
    | "released"
    | "refunded";

export interface Escrow {
    id: string;
    itemName: string;
    price: number;
    buyerId: string;
    sellerId: string;
    sellerEmail?: string;
    description?: string;
    status: EscrowStatus;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateEscrowPayload {
    itemName: string;
    price: number;
    sellerId: string;
    sellerEmail?: string;
    description?: string;
}

export interface ReleaseEscrowPayload {
    escrowId: string;
    reason?: string;
}