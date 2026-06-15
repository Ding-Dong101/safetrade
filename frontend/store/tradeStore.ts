import { create } from "zustand";
import { Trade } from "@/types/trade";

interface TradeState {
    trades: Trade[];
    selectedTrade: Trade | null;
    isLoading: boolean;
    error: string | null;
    setTrades: (trades: Trade[]) => void;
    setSelectedTrade: (trade: Trade | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearTrades: () => void;
}

export const useTradeStore = create<TradeState>((set) => ({
    trades: [],
    selectedTrade: null,
    isLoading: false,
    error: null,

    setTrades: (trades) => set({ trades }),

    setSelectedTrade: (trade) => set({ selectedTrade: trade }),

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    clearTrades: () =>
        set({
            trades: [],
            selectedTrade: null,
            error: null,
        }),
}));