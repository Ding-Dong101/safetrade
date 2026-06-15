export type TradeStatus =
    | "pending"
    | "funded"
    | "photo_verified"
    | "in_transit"
    | "at_post"
    | "released"
    | "closed";

export interface Trade {
    id: string;
    buyerUsername: string;
    sellerUsername: string;
    amount: number;
    currency: string;
    status: TradeStatus;
    description?: string;
    comments?: string;
    dispatchCode?: string;
    dropoffCode?: string;
    riderId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateTradePayload {
    sellerUsername: string;
    depositAmount: number;
    comments?: string;
}

export interface UpdateTradeStatusPayload {
    tradeId: string;
    status: TradeStatus;
}