import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/auth";

interface AuthState {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    setUser: (user: User, token: string) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
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
        }),
        {
            name: "safetrade-auth",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isLoggedIn: state.isLoggedIn,
            }),
        }
    )
);
