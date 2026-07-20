import { AvailableJob, JobStatus, RiderJob } from "@/types/rider";
import { Trade } from "@/types/trade";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

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
    buyerName: trade.buyerId,
    sellerName: trade.sellerId,
    pickupLocation: "Seller location",
    dropoffLocation: "SafeTrade Post",
    status: toJobStatus(trade),
    dispatchCode: trade.dispatchCode,
    dropoffCode: trade.dropOffCode,
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
            buyerName: trade.buyerId,
            pickupLocation: "Seller location",
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

export const confirmDelivery = async (
    jobId: string,
    dropoffCode: string
): Promise<{ jobId: string }> => {
    await api.post(`/trades/${jobId}/post-dropoff`, {
        dropOffCode: dropoffCode.trim(),
    });
    return { jobId };
};

export const updateRiderLocation = async (
    latitude: number,
    longitude: number
): Promise<{ latitude: number; longitude: number }> => {
    // No backend endpoint for rider location yet.
    return { latitude, longitude };
};
