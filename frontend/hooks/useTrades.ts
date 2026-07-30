import { useEffect } from "react";
import { useTradeStore } from "@/store/tradeStore";
import { getTrades, getTradeById } from "@/services/tradeService";
import { useRoleStore } from "@/store/roleStore";

// Cache TTL: re-fetch from network after 60 seconds.
const CACHE_TTL_MS = 60_000;

export const useTrades = () => {
    const {
        trades,
        selectedTrade,
        isLoading,
        error,
        setTrades,
        setSelectedTrade,
        setLoading,
        setError,
        getCached,
    } = useTradeStore();
    const { activeRole } = useRoleStore();

    const fetchTrades = async (showLoadingSpinner = true) => {
        try {
            if (showLoadingSpinner) {
                setLoading(true);
            }
            setError(null);
            const data = await getTrades(activeRole);
            setTrades(data, activeRole);
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
        const cached = getCached(activeRole);
        const isFresh = cached && (Date.now() - cached.fetchedAt) < CACHE_TTL_MS;

        if (isFresh) {
            // Serve cached data immediately — no skeleton, no loading state.
            setTrades(cached.trades, activeRole);
            // Refresh silently in the background so data stays up to date.
            fetchTrades(false);
        } else {
            // No cache or stale — show skeleton and fetch normally.
            fetchTrades(true);
        }
    }, [activeRole]);

    return {
        trades,
        selectedTrade,
        isLoading,
        error,
        refetch: () => fetchTrades(true),
        fetchTradeById,
    };
};