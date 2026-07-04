import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { MOCK_USER } from "@/constants/data";
import { Role } from "@/types/auth";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "@/constants/theme";

const roles: { label: string; value: Role; color: string }[] = [
    { label: "Buyer", value: "buyer", color: "#3b82f6" },
    { label: "Seller", value: "seller", color: "#7c3aed" },
    { label: "Rider", value: "rider", color: "#00e676" },
];

export default function Profile() {
    const insets = useSafeAreaInsets();
    const { activeRole, switchRole } = useRole();
    const { user, logout } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();

    const [notifications, setNotifications] = useState(true);
    const [biometric, setBiometric] = useState(false);

    const displayName = user
        ? `${user.firstName} ${user.lastName}`
        : MOCK_USER.name;
    const displayEmail = user?.email ?? MOCK_USER.email;
    const displayUsername = user?.username ?? MOCK_USER.username;

    const settingsItems = [
        {
            icon: isDark ? "moon" : "sunny",
            label: "Dark Mode",
            type: "toggle",
            value: isDark,
            onToggle: toggleTheme,
        },
        {
            icon: "notifications",
            label: "Push Notifications",
            type: "toggle",
            value: notifications,
            onToggle: () => setNotifications(!notifications),
        },
        {
            icon: "finger-print",
            label: "Biometric Login",
            type: "toggle",
            value: biometric,
            onToggle: () => setBiometric(!biometric),
        },
        {
            icon: "language",
            label: "Language",
            type: "navigate",
            value: "English",
        },
        {
            icon: "lock-closed",
            label: "Change Password",
            type: "navigate",
        },
        {
            icon: "card",
            label: "Payment Methods",
            type: "navigate",
        },
        {
            icon: "information-circle",
            label: "About",
            type: "navigate",
            value: "v1.0.0",
        },
    ];

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{
                paddingTop: insets.top + spacing[4],
                paddingHorizontal: spacing[4],
                paddingBottom: spacing[20],
                gap: spacing[4],
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 22,
                    fontWeight: "700",
                }}
            >
                Profile
            </Text>

            {/* User Info */}
            <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing[4],
                    }}
                >
                    <Avatar name={displayName} size={56} />
                    <View>
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 18,
                                fontWeight: "700",
                            }}
                        >
                            {displayName}
                        </Text>
                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 13,
                                marginTop: 2,
                            }}
                        >
                            @{displayUsername}
                        </Text>
                        <Text
                            style={{
                                color: colors.mutedForeground,
                                fontSize: 12,
                                marginTop: 2,
                            }}
                        >
                            {displayEmail}
                        </Text>
                    </View>
                </View>
            </Card>

            {/* Role Switcher */}
            <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 15,
                        fontWeight: "600",
                        marginBottom: spacing[3],
                    }}
                >
                    Switch Portal
                </Text>
                <View style={{ flexDirection: "row", gap: spacing[2] }}>
                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role.value}
                            onPress={() => switchRole(role.value)}
                            style={{
                                flex: 1,
                                paddingVertical: spacing[2],
                                paddingHorizontal: spacing[3],
                                borderRadius: 8,
                                alignItems: "center",
                                backgroundColor:
                                    activeRole === role.value
                                        ? role.color
                                        : colors.cardAlt,
                                borderWidth: 1,
                                borderColor:
                                    activeRole === role.value
                                        ? role.color
                                        : colors.border,
                            }}
                        >
                            <Text
                                style={{
                                    color:
                                        activeRole === role.value
                                            ? "#ffffff"
                                            : colors.muted,
                                    fontSize: 13,
                                    fontWeight: "600",
                                }}
                            >
                                {role.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>

            {/* Stats */}
            <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 15,
                        fontWeight: "600",
                        marginBottom: spacing[3],
                    }}
                >
                    Stats
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    {[
                        { label: "Active Deals", value: MOCK_USER.activeDeals },
                        { label: "Reviews", value: MOCK_USER.totalReviews },
                    ].map((stat) => (
                        <View key={stat.label} style={{ alignItems: "center" }}>
                            <Text
                                style={{
                                    color: colors.primary,
                                    fontSize: 24,
                                    fontWeight: "700",
                                }}
                            >
                                {stat.value}
                            </Text>
                            <Text style={{ color: colors.muted, fontSize: 12 }}>
                                {stat.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </Card>

            {/* Settings */}
            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 15,
                    fontWeight: "600",
                }}
            >
                Settings
            </Text>

            <Card style={{ backgroundColor: colors.card, borderColor: colors.border, gap: spacing[1] }}>
                {settingsItems.map((item, index) => (
                    <View key={item.label}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: spacing[3],
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: spacing[3],
                                }}
                            >
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 8,
                                        backgroundColor: colors.cardAlt,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={18}
                                        color={colors.primary}
                                    />
                                </View>
                                <Text
                                    style={{
                                        color: colors.foreground,
                                        fontSize: 14,
                                        fontWeight: "500",
                                    }}
                                >
                                    {item.label}
                                </Text>
                            </View>

                            {item.type === "toggle" ? (
                                <Switch
                                    value={item.value as boolean}
                                    onValueChange={item.onToggle}
                                    trackColor={{
                                        false: colors.border,
                                        true: colors.primary,
                                    }}
                                    thumbColor="#ffffff"
                                />
                            ) : (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: spacing[2],
                                    }}
                                >
                                    {item.value && (
                                        <Text
                                            style={{
                                                color: colors.muted,
                                                fontSize: 13,
                                            }}
                                        >
                                            {item.value}
                                        </Text>
                                    )}
                                    <Ionicons
                                        name="chevron-forward"
                                        size={16}
                                        color={colors.muted}
                                    />
                                </View>
                            )}
                        </View>

                        {index < settingsItems.length - 1 && (
                            <View
                                style={{
                                    height: 1,
                                    backgroundColor: colors.border,
                                }}
                            />
                        )}
                    </View>
                ))}
            </Card>

            {/* Logout */}
            <Button
                label="Log Out"
                onPress={logout}
                variant="outlined"
                style={{ borderColor: colors.danger }}
                textStyle={{ color: colors.danger }}
            />
        </ScrollView>
    );
}