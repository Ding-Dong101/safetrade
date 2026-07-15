import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useRoleStore } from "@/store/roleStore";

export default function Index() {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const activeRole = useRoleStore((state) => state.activeRole);

    if (!isLoggedIn) {
        return <Redirect href="/login" />;
    }

    return <Redirect href={`/(${activeRole})/home` as any} />;
}
