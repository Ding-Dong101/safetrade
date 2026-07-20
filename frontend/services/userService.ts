import api from "@/services/api";

export interface UserSummary {
    id: string;
    username: string;
}

export const getUserById = async (id: string): Promise<UserSummary | undefined> => {
    try {
        const { data } = await api.get<UserSummary>(`/users/${id}`);
        return data;
    } catch {
        return undefined;
    }
};