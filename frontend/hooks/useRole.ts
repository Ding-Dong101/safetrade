import { useRoleStore } from "@/store/roleStore";
import { Role } from "@/types/auth";

export const useRole = () => {
    const { activeRole, setRole, isBuyer, isSeller, isRider } = useRoleStore();

    const switchRole = (role: Role) => {
        setRole(role);
    };

    return {
        activeRole,
        switchRole,
        isBuyer: isBuyer(),
        isSeller: isSeller(),
        isRider: isRider(),
    };
};