import { Platform } from "react-native";
import { useAuthStore } from "@/store/authStore";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://safetrade-or1w.onrender.com/api";
 
const request = async <T = any>(
    method: string,
    path: string,
    body?: unknown
): Promise<{ data: T }> => {
    const token = useAuthStore.getState().token;

    console.log(`[API Request] ${method} ${BASE_URL}${path}`, body ? body : "");

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            ...(["POST", "PUT", "PATCH"].includes(method.toUpperCase()) ? { "Content-Type": "application/json" } : {}),
            "User-Agent": `SafeTrade/1.0 (${Platform.OS})`,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let data: any = null;
    try {
        data = JSON.parse(text);
    } catch {
        data = text || null;
    }

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            console.warn(`[API Auth Expired/Forbidden] ${method} ${path} - Status: ${response.status}`);
        } else {
            console.error(`[API Error] ${method} ${path} - Status: ${response.status}`, data);
        }
        // Stored token expired or was rejected — drop the session only on 401 Unauthorized
        if (response.status === 401 && token && !path.includes("/login") && !path.includes("/link-preview")) {
            useAuthStore.getState().clearUser();
        }
        let errorMessage = `Request failed (${response.status})`;
        if (typeof data === "string") {
            errorMessage = data;
        } else if (data && typeof data === "object") {
            errorMessage = data.message || data.error || errorMessage;
        }

        // Add helpful context for 500 errors, which often relate to Paystack payout rejections on Render
        if (response.status >= 500) {
             errorMessage = `Server Error: ${errorMessage}. (If confirming delivery, ensure the Seller's Mobile Money details are valid and saved in their Settings).`;
        }

        const error: any = new Error(errorMessage);
        error.response = { status: response.status, data };
        throw error;
    }

    console.log(`[API Response] ${method} ${path} - Status: ${response.status}`);
    return { data };
};

const api = {
    get: <T = any>(path: string) => request<T>("GET", path),
    post: <T = any>(path: string, body?: unknown) => request<T>("POST", path, body),
    put: <T = any>(path: string, body?: unknown) => request<T>("PUT", path, body),
    patch: <T = any>(path: string, body?: unknown) => request<T>("PATCH", path, body),
    delete: <T = any>(path: string) => request<T>("DELETE", path),
};

export default api;
