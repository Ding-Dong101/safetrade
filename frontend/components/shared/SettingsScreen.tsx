import { useState } from "react";
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
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
    const { user, token, logout, setUser } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username;

    const handlePickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(
                "Permission needed",
                "Allow photo library access to set a profile picture."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]?.uri && user && token) {
            setUser({ ...user, avatar: result.assets[0].uri }, token);
        }
    };

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

            <Card>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing[4],
                    }}
                >
                    <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8}>
                        <Avatar
                            name={fullName}
                            source={user?.avatar ? { uri: user.avatar } : undefined}
                            size={72}
                        />
                        <View
                            style={{
                                position: "absolute",
                                bottom: -2,
                                right: -2,
                                backgroundColor: colors.primary,
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                alignItems: "center",
                                justifyContent: "center",
                                borderWidth: 2,
                                borderColor: colors.card,
                            }}
                        >
                            <Ionicons name="camera" size={14} color={colors.background} />
                        </View>
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 17,
                                fontWeight: "700",
                            }}
                            numberOfLines={1}
                        >
                            {fullName ?? "Guest"}
                        </Text>
                        {user?.email ? (
                            <Text
                                style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}
                                numberOfLines={1}
                            >
                                {user.email}
                            </Text>
                        ) : null}
                        <Text
                            style={{
                                color: colors.primary,
                                fontSize: 12,
                                fontWeight: "600",
                                marginTop: 4,
                            }}
                            onPress={handlePickAvatar}
                        >
                            Change profile photo
                        </Text>
                    </View>
                </View>
            </Card>

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
