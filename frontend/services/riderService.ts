import { AvailableJob, RiderJob } from "@/types/rider";
import { MOCK_AVAILABLE_JOBS, MOCK_RIDER_JOBS } from "@/constants/data";

// Mock rider service — replace with real API calls when the backend is ready.

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getOngoingJobs = async (): Promise<RiderJob[]> => {
    await delay(400);
    return [...MOCK_RIDER_JOBS];
};

export const getAvailableJobs = async (): Promise<AvailableJob[]> => {
    await delay(400);
    return [...MOCK_AVAILABLE_JOBS];
};

export const acceptJob = async (jobId: string): Promise<{ jobId: string }> => {
    await delay(400);
    return { jobId };
};

export const confirmPickup = async (
    jobId: string,
    dispatchCode: string
): Promise<{ jobId: string }> => {
    await delay(400);
    if (dispatchCode.trim().length < 4) {
        throw new Error("Invalid dispatch code");
    }
    return { jobId };
};

export const confirmDelivery = async (
    jobId: string,
    dropoffCode: string
): Promise<{ jobId: string }> => {
    await delay(400);
    if (dropoffCode.trim().length < 4) {
        throw new Error("Invalid drop-off code");
    }
    return { jobId };
};

export const updateRiderLocation = async (
    latitude: number,
    longitude: number
): Promise<{ latitude: number; longitude: number }> => {
    await delay(200);
    return { latitude, longitude };
};
