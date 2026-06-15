import { create } from "zustand";
import { User, Role } from "@/types/auth";

interface AuthState {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    setUser: (user: User, token: string) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoggedIn: false,
    isLoading: false,

    setUser: (user, token) =>
        set({
            user,
            token,
            isLoggedIn: true,
        }),

    clearUser: () =>
        set({
            user: null,
            token: null,
            isLoggedIn: false,
        }),

    setLoading: (loading) => set({ isLoading: loading }),
}));