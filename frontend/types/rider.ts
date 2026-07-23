export type JobStatus =
    | "pending_dispatch"
    | "accepted"
    | "picked_up"
    | "in_transit"
    | "delivered";

export interface RiderJob {
    id: string;
    tradeId: string;
    tradeCode?: string;
    title?: string;
    buyerName: string;
    sellerName: string;
    pickupLocation: string;
    dropoffLocation: string;
    status: JobStatus;
    dispatchCode?: string;
    dropoffCode?: string;
    directDeliveryCode?: string;
    assignedAt: string;
    deliveredAt?: string;
}

export interface AvailableJob {
    id: string;
    tradeId: string;
    tradeCode?: string;
    title?: string;
    buyerName: string;
    pickupLocation: string;
    dropoffLocation: string;
    estimatedDistance?: string;
}

export interface RiderLocation {
    riderId: string;
    latitude: number;
    longitude: number;
    updatedAt: string;
}

export interface ConfirmPickupPayload {
    jobId: string;
    dispatchCode: string;
}

export interface ConfirmDeliveryPayload {
    jobId: string;
    dropoffCode: string;
}