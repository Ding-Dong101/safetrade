import { CreateTradePayload, Trade, TradeStatus } from "@/types/trade";
import { Role } from "@/types/auth";
import { MOCK_TRADES } from "@/constants/data";

// Mock trade service — keeps an in-memory copy of the mock trades so screens can
// create/accept/update trades. Swap for real API calls when the backend is ready.

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let trades: Trade[] = [...MOCK_TRADES];

const generateCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

export const getTrades = async (_role: Role): Promise<Trade[]> => {
    await delay(400);
    return [...trades];
};

export const getTradeById = async (id: string): Promise<Trade | undefined> => {
    await delay(300);
    return trades.find((trade) => trade.id === id);
};

export const createTrade = async (
    payload: CreateTradePayload
): Promise<{ trade: Trade; tradeCode: string }> => {
    await delay(600);

    const tradeCode = generateCode();
    const trade: Trade = {
        id: `${tradeCode}-${trades.length + 1}`,
        buyerId: "",
        sellerId: payload.sellerId,
        title: payload.title,
        description: payload.description,
        price: payload.price,
        status: "CREATED",
        createdAt: new Date().toISOString(),
    };

    trades = [trade, ...trades];
    return { trade, tradeCode };
};

export const acceptTradeByCode = async (code: string): Promise<Trade> => {
    await delay(600);

    const normalized = code.trim().toUpperCase();
    if (normalized.length < 4) {
        throw new Error("Invalid trade code");
    }

    const matched = trades.find((trade) =>
        trade.id.toUpperCase().startsWith(normalized)
    );

    if (matched) {
        matched.buyerId = "buyer-001";
        matched.status = "PENDING";
        return { ...matched };
    }

    // Unknown codes create a fresh pending trade so the mock flow always works.
    const trade: Trade = {
        id: `${normalized}-${trades.length + 1}`,
        buyerId: "buyer-001",
        sellerId: "seller-001",
        title: "New Trade",
        description: "Accepted via trade code.",
        price: 0,
        status: "PENDING",
        createdAt: new Date().toISOString(),
    };

    trades = [trade, ...trades];
    return trade;
};

export const updateTradeStatus = async (
    tradeId: string,
    status: TradeStatus
): Promise<Trade> => {
    await delay(300);

    const trade = trades.find((item) => item.id === tradeId);
    if (!trade) {
        throw new Error("Trade not found");
    }

    trade.status = status;
    return { ...trade };
};
