import { useAuthStore } from "@/store/authStore";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";

const request = async <T = any>(
    method: string,
    path: string,
    body?: unknown
): Promise<{ data: T }> => {
    const token = useAuthStore.getState().token;

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error: any = new Error(data?.message ?? `Request failed (${response.status})`);
        error.response = { status: response.status, data };
        throw error;
    }

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
