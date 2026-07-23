import { AvailableJob, JobStatus, RiderJob } from "@/types/rider";
import { Trade } from "@/types/trade";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { getUserById } from "@/services/userService";

// Real rider service backed by the trades API. Rider "jobs" are trades in the
// dispatch/transit stages; job id === trade id.

const toJobStatus = (trade: Trade): JobStatus => {
    switch (trade.status) {
        case "DISPATCH_PENDING":
            return "accepted";
        case "IN_TRANSIT":
            return "in_transit";
        case "AT_POST":
        case "RELEASED":
            return "delivered";
        default:
            return "pending_dispatch";
    }
};

const toRiderJob = (trade: Trade): RiderJob => ({
    id: trade.id,
    tradeId: trade.id,
    tradeCode: trade.tradeCode,
    title: trade.title,
    buyerName: trade.buyerId,
    sellerName: trade.sellerId,
    pickupLocation: trade.pickupLocation || "Seller location",
    dropoffLocation: "SafeTrade Post",
    status: toJobStatus(trade),
    dispatchCode: trade.dispatchCode,
    dropoffCode: trade.dropOffCode,
    directDeliveryCode: trade.directDeliveryCode,
    assignedAt: trade.riderPickedUpAt ?? trade.createdAt,
});

export const getOngoingJobs = async (): Promise<RiderJob[]> => {
    const riderId = useAuthStore.getState().user?.id;
    const { data } = await api.get<Trade[]>("/trades/?role=all");
    return data
        .filter(
            (trade) => trade.riderId === riderId && trade.status === "IN_TRANSIT"
        )
        .map(toRiderJob);
};

export const getAvailableJobs = async (): Promise<AvailableJob[]> => {
    const { data } = await api.get<Trade[]>("/trades/?role=all");
    return data
        .filter((trade) => trade.status === "DISPATCH_PENDING")
        .map((trade) => ({
            id: trade.id,
            tradeId: trade.id,
            tradeCode: trade.tradeCode,
            title: trade.title,
            buyerName: trade.buyerId,
            pickupLocation: trade.pickupLocation || "Seller location",
            dropoffLocation: "SafeTrade Post",
        }));
};

export const acceptJob = async (jobId: string): Promise<{ jobId: string }> => {
    // The backend assigns the rider at pickup (rider-pickup with the dispatch
    // code), so accepting is a client-side step only.
    return { jobId };
};

export const confirmPickup = async (
    jobId: string,
    dispatchCode: string
): Promise<{ jobId: string }> => {
    const riderId = useAuthStore.getState().user?.id;
    if (!riderId) {
        throw new Error("You must be logged in as a rider");
    }
    await api.post(`/trades/${jobId}/rider-pickup`, {
        riderId,
        dispatchCode: dispatchCode.trim(),
    });
    return { jobId };
};

// confirmDelivery accepts either the Post Drop-Off code or the Direct Delivery code.
// The backend validates both and routes to the correct fulfillment path automatically.
export const confirmDelivery = async (
    jobId: string,
    code: string
): Promise<{ jobId: string; status: string }> => {
    const { data } = await api.post<Trade>(`/trades/${jobId}/post-dropoff`, {
        dropOffCode: code.trim(),
        code: code.trim(),
    });
    return { jobId, status: data.status };
};

export const updateRiderLocation = async (
    latitude: number,
    longitude: number
): Promise<{ latitude: number; longitude: number }> => {
    // No backend endpoint for rider location yet.
    return { latitude, longitude };
};


// Rider previews a trade using the rider code the seller gave them
export const previewTradeByRiderCode = async (code: string): Promise<Trade> => {
    const { data } = await api.get<Trade>(`/trades/rider-code/${code.trim()}`);
    return data;
};

// Rider accepts the delivery after previewing it
export const riderAcceptDelivery = async (tradeId: string): Promise<Trade> => {
    const riderId = useAuthStore.getState().user?.id;
    if (!riderId) {
        throw new Error("You must be logged in as a rider");
    }
    const { data } = await api.post<Trade>(`/trades/${tradeId}/rider-accept`, {
        riderId,
    });
    return data;
};

// Rider looks up trade + buyer info before confirming drop-off
export const getTradeForDropoff = async (
    tradeId: string
): Promise<{ trade: Trade; buyerUsername: string }> => {
    const { data } = await api.get<Trade>(`/trades/${tradeId}`);
    const buyer = await getUserById(data.buyerId);
    return { trade: data, buyerUsername: buyer?.username ?? data.buyerId };
};

// Rider confirms drop-off — this triggers automatic escrow release to the seller
export const riderConfirmDropoff = async (tradeId: string): Promise<Trade> => {
    const { data } = await api.post<Trade>(`/trades/${tradeId}/rider-confirm`, {
        tradeId,
    });
    return data;
};