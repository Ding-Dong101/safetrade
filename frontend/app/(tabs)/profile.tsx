import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: insets.top + spacing[6],
                paddingHorizontal: spacing[5],
            }}
        >
            {/* Title */}
            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 24,
                    fontWeight: "800",
                    marginBottom: spacing[6],
                }}
            >
                Account Profile
            </Text>

            {/* Profile Card */}
            <View
                style={{
                    backgroundColor: colors.card,
                    borderRadius: 24,
                    padding: spacing[5],
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                    marginBottom: spacing[6],
                }}
            >
                {/* Avatar Placeholder */}
                <View
                    style={{
                        width: 90,
                        height: 90,
                        borderRadius: 45,
                        backgroundColor: colors.primary + "15",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: spacing[4],
                        borderWidth: 2,
                        borderColor: colors.primary + "40",
                    }}
                >
                    <Ionicons name="person" size={44} color={colors.primary} />
                </View>

                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 20,
                        fontWeight: "700",
                        marginBottom: 4,
                    }}
                >
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : ""}
                </Text>

                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 14,
                        marginBottom: spacing[4],
                    }}
                >
                    @{user?.username || ""}
                </Text>

                {/* Details list */}
                <View style={{ width: "100%", gap: spacing[3], marginTop: spacing[2] }}>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: spacing[2],
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                        }}
                    >
                        <Text style={{ color: colors.muted, fontSize: 13 }}>Email Address</Text>
                        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                            {user?.email || ""}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: spacing[2],
                        }}
                    >
                        <Text style={{ color: colors.muted, fontSize: 13 }}>Account Type</Text>
                        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700" }}>
                            {user?.isAdmin ? "Administrator" : "Standard Member"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Logout button */}
            <TouchableOpacity
                onPress={logout}
                activeOpacity={0.7}
                style={{
                    backgroundColor: colors.danger + "20",
                    borderWidth: 1,
                    borderColor: colors.danger + "40",
                    borderRadius: 14,
                    paddingVertical: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                }}
            >
                <Ionicons name="log-out" size={20} color={colors.danger} />
                <Text
                    style={{
                        color: colors.danger,
                        fontSize: 16,
                        fontWeight: "700",
                    }}
                >
                    Sign Out
                </Text>
            </TouchableOpacity>
        </View>
    );
}
