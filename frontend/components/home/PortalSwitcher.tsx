import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { useRole } from "@/hooks/useRole";
import { Role } from "@/types/auth";

const PORTALS: { role: Role; label: string; route: string }[] = [
    { role: "buyer", label: "Buyer Portal", route: "/(buyer)/home" },
    { role: "seller", label: "Seller Portal", route: "/(seller)/home" },
    { role: "rider", label: "Rider Portal", route: "/(rider)/home" },
    { role: "post", label: "Post Portal", route: "/(post)/home" },
];

interface PortalSwitcherProps {
    role: Role;
}

const PortalSwitcher = ({ role }: PortalSwitcherProps) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { switchRole } = useRole();

    const current = PORTALS.find((portal) => portal.role === role) ?? PORTALS[0];

    const handleSelect = (portal: (typeof PORTALS)[number]) => {
        setOpen(false);
        if (portal.role === role) return;
        switchRole(portal.role);
        router.replace(portal.route as any);
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
                            minWidth: 160,
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
                                        alignItems: "center",
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
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Modal>
        </>
    );
};

export default PortalSwitcher;
