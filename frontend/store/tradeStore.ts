import { create } from "zustand";
import { Trade } from "@/types/trade";

// Per-role cache entry: the trade list + when it was fetched.
interface CacheEntry {
    trades: Trade[];
    fetchedAt: number; // ms timestamp
}

interface TradeState {
    trades: Trade[];
    selectedTrade: Trade | null;
    isLoading: boolean;
    error: string | null;
    // Per-role cache keyed by role string.
    cache: Record<string, CacheEntry>;
    setTrades: (trades: Trade[], role: string) => void;
    setSelectedTrade: (trade: Trade | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearTrades: () => void;
    getCached: (role: string) => CacheEntry | null;
}

export const useTradeStore = create<TradeState>((set, get) => ({
    trades: [],
    selectedTrade: null,
    isLoading: false,
    error: null,
    cache: {},

    setTrades: (trades, role) =>
        set((state) => ({
            trades,
            cache: {
                ...state.cache,
                [role]: { trades, fetchedAt: Date.now() },
            },
        })),

    setSelectedTrade: (trade) => set({ selectedTrade: trade }),

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    clearTrades: () =>
        set({
            trades: [],
            selectedTrade: null,
            error: null,
            cache: {},
        }),

    getCached: (role) => get().cache[role] ?? null,
}));