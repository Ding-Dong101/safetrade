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
    buyerId?: string;
    sellerId?: string;
    sourceUrl?: string;
    platform?: string;
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
    updatedAt?: string;
    riderPickedUpAt?: string;
    postArrivedAt?: string;
}

export interface CreateTradePayload {
    title: string;
    description?: string;
    pickupLocation?: string;
    price: number;
    sellerId?: string;
    buyerId?: string;
    sourceUrl?: string;
    platform?: string;
    itemPhotoBase64?: string;
}

export interface CreateBuyerTradePayload {
    title: string;
    description?: string;
    pickupLocation?: string;
    price: number;
    buyerId: string;
    sellerId?: string;
    sourceUrl?: string;
    platform?: string;
    itemPhotoBase64?: string;
}

export interface UpdateTradeStatusPayload {
    tradeId: string;
    status: TradeStatus;
}