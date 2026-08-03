import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/auth";
import { requestRoleApproval } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const PORTALS: { role: Role; label: string; route: string; isServiceRole?: boolean }[] = [
    { role: "buyer", label: "Buyer Portal", route: "/(buyer)/home" },
    { role: "seller", label: "Seller Portal", route: "/(seller)/home" },
    { role: "rider", label: "Rider Portal", route: "/(rider)/home", isServiceRole: true },
    { role: "post", label: "Post Portal", route: "/(post)/home", isServiceRole: true },
];

interface PortalSwitcherProps {
    role: Role;
}

const PortalSwitcher = ({ role }: PortalSwitcherProps) => {
    const [open, setOpen] = useState(false);
    const [activationModal, setActivationModal] = useState<(typeof PORTALS)[number] | null>(null);
    const [isActivating, setIsActivating] = useState(false);

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { switchRole } = useRole();
    const { user, updateUser } = useAuth();

    const current = PORTALS.find((portal) => portal.role === role) ?? PORTALS[0];

    const handleSelect = (portal: (typeof PORTALS)[number]) => {
        setOpen(false);
        if (portal.role === role) return;

        // Check if role requires service onboarding approval
        if (portal.role === "rider" && !user?.isRiderApproved) {
            setActivationModal(portal);
            return;
        }
        if (portal.role === "post" && !user?.isPostApproved) {
            setActivationModal(portal);
            return;
        }

        switchRole(portal.role);
        router.replace(portal.route as any);
    };

    const handleActivateRole = async () => {
        if (!activationModal) return;
        try {
            setIsActivating(true);
            const res = await requestRoleApproval(activationModal.role as "rider" | "post");
            updateUser(res.user);
            Toast.show({
                type: "success",
                text1: "Role Activated",
                text2: `You now have access to the ${activationModal.label}.`,
            });
            const target = activationModal;
            setActivationModal(null);
            switchRole(target.role);
            router.replace(target.route as any);
        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: "Activation Failed",
                text2: err?.message || "Could not activate role at this time.",
            });
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                activeOpacity={0.8}
                style={{
                    backgroundColor: colors.info,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 20,
                }}
            >
                <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "700" }}>
                    {current.label}
                </Text>
            </TouchableOpacity>

            {/* Portal Switcher Dropdown Modal */}
            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <Pressable
                    onPress={() => setOpen(false)}
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
                >
                    <View
                        style={{
                            position: "absolute",
                            top: insets.top + spacing[12],
                            right: spacing[4],
                            backgroundColor: colors.card,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: colors.border,
                            padding: spacing[3],
                            gap: spacing[2],
                            minWidth: 170,
                        }}
                    >
                        {PORTALS.map((portal) => {
                            const isActive = portal.role === role;
                            return (
                                <TouchableOpacity
                                    key={portal.role}
                                    onPress={() => handleSelect(portal)}
                                    activeOpacity={0.8}
                                    style={{
                                        borderWidth: 1,
                                        borderColor: colors.info,
                                        backgroundColor: isActive
                                            ? colors.info
                                            : "transparent",
                                        borderRadius: 20,
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                        alignItems: "center",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        gap: 6,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: isActive ? "#ffffff" : colors.info,
                                            fontSize: 12,
                                            fontWeight: "700",
                                        }}
                                    >
                                        {portal.label}
                                    </Text>
                                    {portal.isServiceRole && (
                                        <Ionicons
                                            name={
                                                (portal.role === "rider" && user?.isRiderApproved) ||
                                                (portal.role === "post" && user?.isPostApproved)
                                                    ? "checkmark-circle"
                                                    : "lock-closed-outline"
                                            }
                                            size={12}
                                            color={isActive ? "#ffffff" : colors.info}
                                        />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Modal>

            {/* Service Role Activation Modal */}
            <Modal
                visible={!!activationModal}
                transparent
                animationType="fade"
                onRequestClose={() => setActivationModal(null)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 24,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: colors.card,
                            borderRadius: 24,
                            padding: 24,
                            width: "100%",
                            maxWidth: 380,
                            borderWidth: 1,
                            borderColor: colors.border,
                            alignItems: "center",
                        }}
                    >
                        <View
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: `${colors.info}20`,
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 16,
                            }}
                        >
                            <Ionicons
                                name={activationModal?.role === "rider" ? "bicycle" : "business"}
                                size={28}
                                color={colors.info}
                            />
                        </View>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "800",
                                color: colors.foreground,
                                marginBottom: 8,
                                textAlign: "center",
                            }}
                        >
                            Activate {activationModal?.label}
                        </Text>
                        <Text
                            style={{
                                fontSize: 13,
                                color: colors.muted,
                                textAlign: "center",
                                lineHeight: 19,
                                marginBottom: 20,
                            }}
                        >
                            {activationModal?.role === "rider"
                                ? "Access dispatch orders, verify package pickups, and handle secure deliveries for buyers and sellers."
                                : "Handle post office parcel drop-offs, verify dispatch codes, and manage secure package holding."}
                        </Text>

                        <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                            <TouchableOpacity
                                onPress={() => setActivationModal(null)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 14,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: colors.muted, fontWeight: "600" }}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleActivateRole}
                                disabled={isActivating}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 14,
                                    backgroundColor: colors.primary,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {isActivating ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={{ color: "#ffffff", fontWeight: "700" }}>
                                        Activate
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default PortalSwitcher;
