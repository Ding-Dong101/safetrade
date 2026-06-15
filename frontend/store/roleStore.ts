import { create } from "zustand";
import { Role } from "@/types/auth";

interface RoleState {
    activeRole: Role;
    setRole: (role: Role) => void;
    isBuyer: () => boolean;
    isSeller: () => boolean;
    isRider: () => boolean;
}

export const useRoleStore = create<RoleState>((set, get) => ({
    activeRole: "buyer",

    setRole: (role) => set({ activeRole: role }),

    isBuyer: () => get().activeRole === "buyer",
    isSeller: () => get().activeRole === "seller",
    isRider: () => get().activeRole === "rider",
}));