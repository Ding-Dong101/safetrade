import { useState } from "react";
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Card from "@/components/ui/Card";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";

interface SettingRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
    isLast?: boolean;
}

const SettingRow = ({ icon, label, onPress, rightElement, danger, isLast }: SettingRowProps) => {
    const { colors, spacing } = useTheme();
    const color = danger ? colors.danger : colors.foreground;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
            style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: spacing[4],
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: colors.border,
                gap: spacing[3],
            }}
        >
            <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.muted} />
            <Text style={{ flex: 1, color, fontSize: 15, fontWeight: "500" }}>
                {label}
            </Text>
            {rightElement ??
                (onPress ? (
                    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                ) : null)}
        </TouchableOpacity>
    );
};

const SettingsScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing, isDark, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleLogout = () => {
        Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Log Out",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    router.replace("/login");
                },
            },
        ]);
    };

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{
                paddingHorizontal: spacing[4],
                paddingTop: insets.top + spacing[4],
                paddingBottom: spacing[24],
                gap: spacing[4],
            }}
            showsVerticalScrollIndicator={false}
        >
            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 22,
                    fontWeight: "700",
                }}
            >
                Settings
            </Text>

            <Card style={{ paddingVertical: 0 }}>
                <SettingRow
                    icon={isDark ? "moon" : "sunny"}
                    label="Light Theme"
                    rightElement={
                        <Switch
                            value={!isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.cardAlt, true: colors.primary }}
                            thumbColor="#ffffff"
                        />
                    }
                />
                <SettingRow
                    icon="notifications-outline"
                    label="Notifications"
                    rightElement={
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: colors.cardAlt, true: colors.primary }}
                            thumbColor="#ffffff"
                        />
                    }
                />
                <SettingRow
                    icon="shield-checkmark-outline"
                    label="Privacy and Security"
                    onPress={() =>
                        Alert.alert(
                            "Privacy and Security",
                            "Manage your password, two-factor authentication and data preferences here soon."
                        )
                    }
                />
                <SettingRow
                    icon="help-circle-outline"
                    label="Help and Support"
                    onPress={() =>
                        Alert.alert(
                            "Help and Support",
                            "Reach us at support@safetrade.com or visit the FAQ."
                        )
                    }
                    isLast
                />
            </Card>

            <Card style={{ paddingVertical: 0 }}>
                <SettingRow
                    icon="log-out-outline"
                    label="Log Out"
                    onPress={handleLogout}
                    danger
                    isLast
                />
            </Card>

            <View style={{ alignItems: "center", marginTop: spacing[2] }}>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                    SafeTrade v1.0.0
                </Text>
            </View>
        </ScrollView>
    );
};

export default SettingsScreen;
