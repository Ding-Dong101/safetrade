import api from "./api";
import {
    RiderJob,
    AvailableJob,
    ConfirmPickupPayload,
    ConfirmDeliveryPayload,
    RiderLocation,
} from "@/types/rider";

export const getOngoingJobs = async (): Promise<RiderJob[]> => {
    const response = await api.get("/rider/jobs/ongoing");
    return response.data;
};

export const getAvailableJobs = async (): Promise<AvailableJob[]> => {
    const response = await api.get("/rider/jobs/available");
    return response.data;
};

export const acceptJob = async (jobId: string): Promise<RiderJob> => {
    const response = await api.post(`/rider/jobs/${jobId}/accept`);
    return response.data;
};

export const ignoreJob = async (jobId: string): Promise<void> => {
    await api.post(`/rider/jobs/${jobId}/ignore`);
};

export const confirmPickup = async (payload: ConfirmPickupPayload): Promise<RiderJob> => {
    const response = await api.post(`/rider/jobs/${payload.jobId}/pickup`, {
        dispatchCode: payload.dispatchCode,
    });
    return response.data;
};

export const confirmDelivery = async (payload: ConfirmDeliveryPayload): Promise<RiderJob> => {
    const response = await api.post(`/rider/jobs/${payload.jobId}/deliver`, {
        dropoffCode: payload.dropoffCode,
    });
    return response.data;
};

export const updateRiderLocation = async (
    latitude: number,
    longitude: number
): Promise<RiderLocation> => {
    const response = await api.post("/rider/location", { latitude, longitude });
    return response.data;
};