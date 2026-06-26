import api from "./api";
import { Trade, CreateTradePayload, UpdateTradeStatusPayload } from "@/types/trade";

export const getTrades = async (): Promise<Trade[]> => {
    const response = await api.get("/trades");
    return response.data;
};

export const getTradeById = async (id: string): Promise<Trade> => {
    const response = await api.get(`/trades/${id}`);
    return response.data;
};

export const createTrade = async (payload: CreateTradePayload): Promise<Trade> => {
    const response = await api.post("/trades", payload);
    return response.data;
};

export const updateTradeStatus = async (payload: UpdateTradeStatusPayload): Promise<Trade> => {
    const response = await api.patch(`/trades/${payload.tradeId}/status`, {
        status: payload.status,
    });
    return response.data;
};

export const verifyTradePhoto = async (tradeId: string, photoUri: string): Promise<Trade> => {
    const response = await api.post(`/trades/${tradeId}/verify-photo`, { photoUri });
    return response.data;
};

export const cancelTrade = async (tradeId: string): Promise<Trade> => {
    const response = await api.patch(`/trades/${tradeId}/cancel`);
    return response.data;
};