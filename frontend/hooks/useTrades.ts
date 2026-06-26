import { useEffect } from "react";
import { useTradeStore } from "@/store/tradeStore";
import { getTrades, getTradeById } from "@/services/tradeService";
import { MOCK_TRADES } from "@/constants/data";

export const useTrades = () => {
    const { trades, selectedTrade, isLoading, error, setTrades, setSelectedTrade, setLoading, setError } =
        useTradeStore();

    const fetchTrades = async () => {
        try {
            setLoading(true);
            setError(null);
            // Swap MOCK_TRADES for getTrades() when backend is ready
            // const data = await getTrades();
            const data = MOCK_TRADES as any;
            setTrades(data);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to fetch trades");
        } finally {
            setLoading(false);
        }
    };

    const fetchTradeById = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            // const data = await getTradeById(id);
            const data = MOCK_TRADES.find((t) => t.id === id) as any;
            setSelectedTrade(data ?? null);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to fetch trade");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, []);

    return {
        trades,
        selectedTrade,
        isLoading,
        error,
        refetch: fetchTrades,
        fetchTradeById,
    };
};