import api from "./api";
import { Trade, CreateTradePayload } from "@/types/trade";

export const getTrades = async (role?: string): Promise<Trade[]> => {
    const response = await api.get("/trades/", {
        params: role ? { role } : {},
    });
    return response.data;
};

export const getTradeById = async (id: string): Promise<Trade> => {
    const response = await api.get(`/trades/${id}`);
    return response.data;
};

export const createTrade = async (payload: CreateTradePayload): Promise<Trade> => {
    const response = await api.post("/trades/", payload);
    return response.data;
};

export const depositFunds = async (tradeId: string): Promise<Trade> => {
    const response = await api.post(`/trades/${tradeId}/deposit`);
    return response.data;
};

export const verifyTradePhoto = async (tradeId: string, photoBase64: string): Promise<Trade> => {
    const response = await api.post(`/trades/${tradeId}/seller-upload`, {
        itemPhotoBase64: photoBase64,
    });
    return response.data;
};

export const confirmRiderPickup = async (tradeId: string, riderId: string, dispatchCode: string): Promise<Trade> => {
    const response = await api.post(`/trades/${tradeId}/rider-pickup`, {
        riderId,
        dispatchCode,
    });
    return response.data;
};

export const confirmPostDropoff = async (tradeId: string, dropOffCode: string): Promise<Trade> => {
    const response = await api.post(`/trades/${tradeId}/post-dropoff`, {
        dropOffCode,
    });
    return response.data;
};

export const confirmBuyerCollect = async (tradeId: string, releaseCode: string): Promise<Trade> => {
    const response = await api.post(`/trades/${tradeId}/buyer-collect`, {
        releaseCode,
    });
    return response.data;
};