import { icons } from "./icons";

export const tabs = [
    { name: "home", title: "Home", icon: icons.home },
   
    { name: "history", title: "History", icon: icons.history },
    
    
];

export const TRADE_STATUSES = [
    "pending",
    "funded",
    "photo_verified",
    "in_transit",
    "at_post",
    "released",
    "closed",
] as const;

export type TradeStatus = typeof TRADE_STATUSES[number];

export const MOCK_TRADES = [
    {
        id: "trade-001",
        buyerName: "HP Enrg",
        amount: 750.00,
        currency: "GHS",
        status: "pending" as TradeStatus,
        description: "Lorem ipsum dolor sit amet consectetur.",
        createdAt: "2026-06-01T10:00:00.000Z",
    },
    {
        id: "trade-002",
        buyerName: "HP Enrg",
        amount: 350.00,
        currency: "GHS",
        status: "funded" as TradeStatus,
        description: "Lorem ipsum dolor sit amet consectetur.",
        createdAt: "2026-06-02T10:00:00.000Z",
    },
    {
        id: "trade-003",
        buyerName: "HP Enrg",
        amount: 760.00,
        currency: "GHS",
        status: "in_transit" as TradeStatus,
        description: "Lorem ipsum dolor sit amet consectetur.",
        createdAt: "2026-06-03T10:00:00.000Z",
    },
    {
        id: "trade-004",
        buyerName: "HP Enrg",
        amount: 760.00,
        currency: "GHS",
        status: "released" as TradeStatus,
        description: "Lorem ipsum dolor sit amet consectetur.",
        createdAt: "2026-06-04T10:00:00.000Z",
    },
];

export const MOCK_USER = {
    name: "Kobby",
    username: "kobby123",
    email: "kobby@safetrade.com",
    availableBalance: 1000.50,
    totalBalance: 3850.50,
    activeDeals: 2,
    totalReviews: 3,
};