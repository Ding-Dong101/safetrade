import { useAuthStore } from "@/store/authStore";
import { login, logout, register } from "@/services/authService";
import { LoginCredentials, RegisterCredentials } from "@/types/auth";

export const useAuth = () => {
    const { user, token, isLoggedIn, isLoading, setUser, clearUser, setLoading } =
        useAuthStore();

    const handleLogin = async (credentials: LoginCredentials) => {
        try {
            setLoading(true);
            const response = await login(credentials);
            setUser(response.user, response.token);
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error?.response?.data?.message ?? "Login failed",
            };
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (credentials: RegisterCredentials) => {
        try {
            setLoading(true);
            await register(credentials);
            return { success: true };
        } catch (error: any) {
            console.error("Registration Exception:", error, error?.response?.data);
            return {
                success: false,
                error: error?.response?.data?.message ?? error?.message ?? "Registration failed",
            };
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            // fail silently
        } finally {
            clearUser();
        }
    };

    return {
        user,
        token,
        isLoggedIn,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        setUser,
    };
};