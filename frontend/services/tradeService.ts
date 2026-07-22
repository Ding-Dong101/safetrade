import { CreateTradePayload, Trade, TradeStatus } from "@/types/trade";
import { Role } from "@/types/auth";
import api from "@/services/api";
// Real trade service backed by the Spring Boot API (/api/trades).
// The backend Trades entity matches the frontend Trade type field-for-field.
export const getTrades = async (role: Role): Promise<Trade[]> => {
    const query = role === "buyer" || role === "seller" ? `?role=${role}` : "";
    const { data } = await api.get<Trade[]>(`/trades/${query}`);
    return data;
};
// All trades regardless of who is party to them — used by rider and post portals.
export const getAllTrades = async (): Promise<Trade[]> => {
    const { data } = await api.get<Trade[]>("/trades/?role=all");
    return data;
};
// Stage 5: rider/post verifies the drop-off code at the SafeTrade post.
export const postDropoff = async (
    tradeId: string,
    dropOffCode: string
): Promise<Trade> => {
    const { data } = await api.post<Trade>(`/trades/${tradeId}/post-dropoff`, {
        dropOffCode: dropOffCode.trim(),
    });
    return data;
};
export const getTradeById = async (id: string): Promise<Trade | undefined> => {
    try {
        const { data } = await api.get<Trade>(`/trades/${id}`);
        return data;
    } catch (error: any) {
        if (error?.response?.status === 404) return undefined;
        throw error;
    }
};
export const createTrade = async (
    payload: CreateTradePayload
): Promise<{ trade: Trade; tradeCode: string; riderCode: string }> => {
    const { data } = await api.post<Trade>("/trades/", payload);
    return {
        trade: data,
        tradeCode: (data as any).tradeCode,
        riderCode: (data as any).riderCode,
    };
};
export const acceptTradeByCode = async (code: string): Promise<Trade> => {
    const tradeCode = code.trim();
    if (tradeCode.length !== 5) {
        throw new Error("Enter the 5-digit trade code");
    }
    const { data } = await api.post<Trade>(`/trades/join/${tradeCode}`);
    return data;
};
// Maps a requested status to the backend transition endpoint.
export const updateTradeStatus = async (
    tradeId: string,
    status: TradeStatus
): Promise<Trade> => {
    switch (status) {
        case "FUNDED": {
            const { data } = await api.post<Trade>(`/trades/${tradeId}/verify-payment`);
            return data;
        }
        case "DELIVERED": {
            const { data } = await api.patch<Trade>(`/escrow/deliver/${tradeId}`);
            return data;
        }
        case "RELEASED": {
            const { data } = await api.post<Trade>(`/escrow/release/${tradeId}`);
            return data;
        }
        case "REFUNDED": {
            const { data } = await api.post<Trade>(`/escrow/refund/${tradeId}`);
            return data;
        }
        default:
            throw new Error(`Unsupported status transition: ${status}`);
    }
};
// Stage 2: buyer deposits funds — returns a real Paystack payment link.
export const depositFunds = async (tradeId: string): Promise<{ authorizationUrl: string }> => {
    const { data } = await api.post<any>(`/trades/${tradeId}/deposit`);
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return { authorizationUrl: parsed?.data?.authorization_url };
};

// Confirms payment completed — verifies with Paystack, then marks the trade FUNDED.
export const verifyPayment = async (tradeId: string): Promise<Trade> => {
    const { data } = await api.post<Trade>(`/trades/${tradeId}/verify-payment`);
    return data;
};
// Stage 3: seller uploads live item photo, backend generates the dispatch code.
export const sellerUpload = async (
    tradeId: string,
    itemPhotoBase64: string
): Promise<Trade> => {
    const { data } = await api.post<Trade>(`/trades/${tradeId}/seller-upload`, {
        itemPhotoBase64,
    });
    return data;
};
// Stage 6: buyer collects from the post using the release code.
export const buyerCollect = async (
    tradeId: string,
    releaseCode: string
): Promise<Trade> => {
    const { data } = await api.post<Trade>(`/trades/${tradeId}/buyer-collect`, {
        releaseCode,
    });
    return data;
};

// Stage 5b: buyer receives directly from rider using rider's drop-off code
export const buyerConfirmRiderDelivery = async (
    tradeId: string,
    dropOffCode: string
): Promise<Trade> => {
    const { data } = await api.post<Trade>(`/trades/${tradeId}/buyer-confirm-rider`, {
        dropOffCode,
    });
    return data;
};