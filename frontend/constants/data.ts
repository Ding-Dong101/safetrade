import { Trade } from "@/types/trade";
import { AvailableJob, RiderJob } from "@/types/rider";

export const MOCK_USER = {
    name: "Kobby",
    username: "kobby123",
    email: "kobby@safetrade.com",
    availableBalance: 1000.5,
    totalBalance: 3850.5,
    escrowBalance: 2850.0,
    activeDeals: 2,
    totalReviews: 3,
};

export const MOCK_TRADES: Trade[] = [
    {
        id: "V63CNA-1",
        buyerId: "buyer-001",
        sellerId: "seller-001",
        title: "HP Envy",
        price: 750.0,
        status: "PENDING",
        description: "Lorem ipsum dolor sit amet consectetur.",
        createdAt: "2026-07-01T10:00:00.000Z",
    },
    {
        id: "V63CNA-2",
        buyerId: "buyer-001",
        sellerId: "seller-001",
        title: "HP Envy",
        price: 750.0,
        status: "FUNDED",
        description: "Lorem ipsum dolor sit amet consectetur.",
        createdAt: "2026-07-02T10:00:00.000Z",
    },
    {
        id: "V63CNA-3",
        buyerId: "buyer-001",
        sellerId: "seller-001",
        title: "HP Envy",
        price: 750.0,
        status: "DISPATCH_PENDING",
        dispatchCode: "13B6AD",
        description: "Lorem ipsum dolor sit amet consectetur.",
        createdAt: "2026-07-03T10:00:00.000Z",
    },
    {
        id: "V63CNA-4",
        buyerId: "buyer-001",
        sellerId: "seller-001",
        title: "HP Envy",
        price: 750.0,
        status: "IN_TRANSIT",
        description: "Lorem ipsum dolor sit amet consectetur.",
        createdAt: "2026-07-04T10:00:00.000Z",
    },
    {
        id: "V63CNA-5",
        buyerId: "buyer-001",
        sellerId: "seller-001",
        title: "HP Envy",
        price: 750.0,
        status: "AT_POST",
        releaseCode: "13B6AC",
        description: "Lorem ipsum dolor sit amet consectetur.",
        createdAt: "2026-07-05T10:00:00.000Z",
    },
    {
        id: "V63CNA-6",
        buyerId: "buyer-001",
        sellerId: "seller-001",
        title: "HP Envy",
        price: 750.0,
        status: "RELEASED",
        description: "Lorem ipsum dolor sit amet consectetur.",
        createdAt: "2026-07-06T10:00:00.000Z",
    },
    {
        id: "V63CNA-7",
        buyerId: "buyer-001",
        sellerId: "seller-001",
        title: "HP Envy",
        price: 750.0,
        status: "CLOSED",
        description: "Lorem ipsum dolor sit amet consectetur.",
        createdAt: "2026-07-07T10:00:00.000Z",
    },
];

export const MOCK_RIDER_JOBS: RiderJob[] = [
    {
        id: "job-001",
        tradeId: "V63CNA-3",
        buyerName: "HP Envy",
        sellerName: "Kobby",
        pickupLocation: "College Of Science",
        dropoffLocation: "Ayeduase Post Office",
        status: "pending_dispatch",
        assignedAt: "2026-07-10T09:00:00.000Z",
    },
    {
        id: "job-002",
        tradeId: "V63CNA-4",
        buyerName: "HP Envy",
        sellerName: "Ama",
        pickupLocation: "College Of Science",
        dropoffLocation: "College Of Science",
        status: "in_transit",
        assignedAt: "2026-07-10T11:30:00.000Z",
    },
];

export const MOCK_AVAILABLE_JOBS: AvailableJob[] = [
    {
        id: "avail-001",
        tradeId: "V63CNA-8",
        buyerName: "HP Envy",
        pickupLocation: "College Of Science",
        dropoffLocation: "Ayeduase Post Office",
    },
    {
        id: "avail-002",
        tradeId: "V63CNA-9",
        buyerName: "Graphic Tee",
        pickupLocation: "Victory Towers",
        dropoffLocation: "Kotei Post Office",
    },
];

export type ParcelStatus = "pending_drop_off" | "awaiting_buyer_collection";

export interface PostParcel {
    id: string;
    tradeId: string;
    itemName: string;
    status: ParcelStatus;
}

export const MOCK_PARCELS: PostParcel[] = [
    {
        id: "parcel-001",
        tradeId: "V63CNA",
        itemName: "HP Envy",
        status: "pending_drop_off",
    },
    {
        id: "parcel-002",
        tradeId: "V63CNA",
        itemName: "Graphic Tee",
        status: "awaiting_buyer_collection",
    },
    {
        id: "parcel-003",
        tradeId: "V63CNA",
        itemName: "Gaming Chair",
        status: "awaiting_buyer_collection",
    },
    {
        id: "parcel-004",
        tradeId: "V63CNA",
        itemName: "Gaming Chair",
        status: "pending_drop_off",
    },
];

export interface ChatPreview {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
}

export const MOCK_CHATS: ChatPreview[] = [
    {
        id: "chat-001",
        name: "Ama (Seller)",
        lastMessage: "The laptop has been dropped off at the post.",
        time: "10:24",
        unread: 2,
    },
    {
        id: "chat-002",
        name: "Kwame (Buyer)",
        lastMessage: "Has the item been photo verified yet?",
        time: "09:12",
        unread: 0,
    },
    {
        id: "chat-003",
        name: "SafeTrade Support",
        lastMessage: "Your dispute has been resolved.",
        time: "Yesterday",
        unread: 0,
    },
];
