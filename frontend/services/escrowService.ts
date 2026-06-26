import api from "./api";
import { Escrow, CreateEscrowPayload, ReleaseEscrowPayload } from "@/types/escrow";

export const getEscrows = async (): Promise<Escrow[]> => {
    const response = await api.get("/escrow");
    return response.data;
};

export const getEscrowById = async (id: string): Promise<Escrow> => {
    const response = await api.get(`/escrow/${id}`);
    return response.data;
};

export const createEscrow = async (payload: CreateEscrowPayload): Promise<Escrow> => {
    const response = await api.post("/escrow", payload);
    return response.data;
};

export const releaseFunds = async (payload: ReleaseEscrowPayload): Promise<Escrow> => {
    const response = await api.post(`/escrow/${payload.escrowId}/release`, {
        reason: payload.reason,
    });
    return response.data;
};

export const raiseDispute = async (escrowId: string, reason: string): Promise<Escrow> => {
    const response = await api.post(`/escrow/${escrowId}/dispute`, { reason });
    return response.data;
};