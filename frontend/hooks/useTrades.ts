import { useEffect } from "react";
import { useTradeStore } from "@/store/tradeStore";
import { getTrades, getTradeById } from "@/services/tradeService";
import { useRoleStore } from "@/store/roleStore";

export const useTrades = () => {
    const { trades, selectedTrade, isLoading, error, setTrades, setSelectedTrade, setLoading, setError } =
        useTradeStore();
    const { activeRole } = useRoleStore();

    const fetchTrades = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTrades(activeRole);
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
            const data = await getTradeById(id);
            setSelectedTrade(data ?? null);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to fetch trade");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, [activeRole]);

    return {
        trades,
        selectedTrade,
        isLoading,
        error,
        refetch: fetchTrades,
        fetchTradeById,
    };
};