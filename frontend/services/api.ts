import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token to every request automatically
api.interceptors.request.use(
    (config) => {
        // Token will be injected here from authStore later
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle global response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - will trigger logout later
            console.warn("Unauthorized. Please log in again.");
        }
        return Promise.reject(error);
    }
);

export default api;