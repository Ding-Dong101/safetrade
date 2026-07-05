import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import ScreenHeader from "@/components/shared/ScreenHeader";
import Card from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";

const MOCK_STATS = [
    { label: "Total Trades", value: "1,245", icon: "swap-horizontal", color: "#3b82f6" },
    { label: "Successful", value: "1,102", icon: "checkmark-circle", color: "#16a34a" },
    { label: "Disputed", value: "43", icon: "warning", color: "#f5c542" },
    { label: "Revenue", value: "GH₵ 48,200", icon: "cash", color: "#00e676" },
];

const MENU_ITEMS = [
    { label: "All Trades", icon: "list", route: "/admin/trades" },
    { label: "Reviews", icon: "star", route: "/admin/reviews" },
];

export default function AdminDashboard() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title="Admin Dashboard" showBack={false} />

            <FlatList
                data={MENU_ITEMS}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push(item.route as any)}
                        style={{
                            backgroundColor: colors.card,
                            borderRadius: 12,
                            padding: spacing[4],
                            marginBottom: spacing[3],
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderWidth: 1,
                            borderColor: colors.border,
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
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    backgroundColor: colors.cardAlt,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={20}
                                    color={colors.primary}
                                />
                            </View>
                            <Text
                                style={{
                                    color: colors.foreground,
                                    fontSize: 15,
                                    fontWeight: "600",
                                }}
                            >
                                {item.label}
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={colors.muted}
                        />
                    </TouchableOpacity>
                )}
                ListHeaderComponent={
                    <View style={{ gap: spacing[4], marginBottom: spacing[4] }}>
                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 13,
                            }}
                        >
                            Overview
                        </Text>

                        {/* Stats Grid */}
                        <View
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: spacing[3],
                            }}
                        >
                            {MOCK_STATS.map((stat) => (
                                <Card
                                    key={stat.label}
                                    style={{
                                        width: "47%",
                                        backgroundColor: colors.card,
                                        borderColor: colors.border,
                                        gap: spacing[2],
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 8,
                                            backgroundColor: stat.color + "20",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Ionicons
                                            name={stat.icon as any}
                                            size={18}
                                            color={stat.color}
                                        />
                                    </View>
                                    <Text
                                        style={{
                                            color: colors.foreground,
                                            fontSize: 20,
                                            fontWeight: "700",
                                        }}
                                    >
                                        {stat.value}
                                    </Text>
                                    <Text
                                        style={{
                                            color: colors.muted,
                                            fontSize: 12,
                                        }}
                                    >
                                        {stat.label}
                                    </Text>
                                </Card>
                            ))}
                        </View>

                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 13,
                            }}
                        >
                            Manage
                        </Text>
                    </View>
                }
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: spacing[10],
                }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}