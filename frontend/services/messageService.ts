import api from "@/services/api";

export interface Message {
    id: string;
    tradeId: string;
    senderId: string;
    content: string;
    read: boolean;
    sentAt: string;
}

export const getMessages = async (tradeId: string): Promise<Message[]> => {
    const { data } = await api.get<Message[]>(`/messages/trade/${tradeId}`);
    return data;
};

export const sendMessage = async (
    tradeId: string,
    content: string
): Promise<Message> => {
    const { data } = await api.post<Message>(`/messages/trade/${tradeId}`, {
        content,
    });
    return data;
};

export const markMessagesRead = async (tradeId: string): Promise<void> => {
    await api.patch(`/messages/trade/${tradeId}/read`);
};