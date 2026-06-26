import { TradeStatus } from "@/types/trade";
import { EscrowStatus } from "@/types/escrow";
import { JobStatus } from "@/types/rider";

export const formatTradeStatus = (status: string): string => {
    const lower = status?.toLowerCase() ?? "";
    const labels: Record<string, string> = {
        pending: "Pending",
        funded: "Funded",
        photo_verified: "Photo Verified",
        dispatch_pending: "Photo Verified",
        in_transit: "In Transit",
        at_post: "At Post",
        delivered: "At Post",
        released: "Released",
        closed: "Closed",
        refunded: "Refunded",
    };
    return labels[lower] ?? formatStatusLabel(status);
};

export const formatEscrowStatus = (status: EscrowStatus): string => {
    const labels: Record<EscrowStatus, string> = {
        pending: "Pending",
        funds_deposited: "Funds Deposited",
        delivered: "Delivered",
        disputed: "Disputed",
        released: "Released",
        refunded: "Refunded",
    };
    return labels[status] ?? "Unknown";
};

export const formatJobStatus = (status: JobStatus): string => {
    const labels: Record<JobStatus, string> = {
        pending_dispatch: "Pending Dispatch",
        accepted: "Accepted",
        picked_up: "Picked Up",
        in_transit: "In Transit",
        delivered: "Delivered",
    };
    return labels[status] ?? "Unknown";
};

export const formatStatusLabel = (value?: string): string => {
    if (!value) return "Unknown";
    return value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};