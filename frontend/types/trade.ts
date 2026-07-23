export type TradeStatus =
    | "CREATED"
    | "FUNDED"
    | "DISPATCH_PENDING"
    | "IN_TRANSIT"
    | "AT_POST"
    | "RELEASED"
    | "PENDING"
    | "DELIVERED"
    | "CLOSED"
    | "REFUNDED";

export interface Trade {
    id: string;
    tradeCode?: string;
    riderCode?: string;
    pickupLocation?: string;
    buyerId: string;
    sellerId: string;
    price: number;
    status: TradeStatus;
    title?: string;
    description?: string;
    dispatchCode?: string;
    dropOffCode?: string;
    directDeliveryCode?: string;
    releaseCode?: string;
    riderId?: string;
    itemPhotoBase64?: string;
    createdAt: string;
    riderPickedUpAt?: string;
    postArrivedAt?: string;
}

export interface CreateTradePayload {
    title: string;
    description?: string;
    pickupLocation?: string;
    price: number;
    sellerId: string;
}

export interface UpdateTradeStatusPayload {
    tradeId: string;
    status: TradeStatus;
}