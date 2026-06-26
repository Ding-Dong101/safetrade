import { View, Text, TouchableOpacity } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { formatCurrency } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";

interface BalanceCardProps {
    available: number;
    total: number;
    activeDeals?: number;
    totalReviews?: number;
    onTopUp?: () => void;
}

const BalanceCard = ({
    available,
    total,
    activeDeals = 0,
    totalReviews = 0,
    onTopUp,
}: BalanceCardProps) => {
    return (
        <View
            style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: spacing[5],
                borderWidth: 1,
                borderColor: colors.border,
                gap: spacing[4],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <View>
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 12,
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            marginBottom: 4,
                        }}
                    >
                        Available Balance
                    </Text>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 24,
                            fontWeight: "800",
                        }}
                    >
                        {formatCurrency(available)}
                    </Text>
                </View>

                {onTopUp && (
                    <TouchableOpacity
                        onPress={onTopUp}
                        activeOpacity={0.7}
                        style={{
                            borderWidth: 1.5,
                            borderColor: colors.primary,
                            paddingHorizontal: spacing[4],
                            paddingVertical: spacing[2],
                            borderRadius: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <Ionicons name="add" size={16} color={colors.primary} />
                        <Text
                            style={{
                                color: colors.primary,
                                fontSize: 13,
                                fontWeight: "700",
                            }}
                        >
                            Top Up
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Divider line */}
            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <View>
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 12,
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            marginBottom: 4,
                        }}
                    >
                        Total Balance
                    </Text>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 20,
                            fontWeight: "700",
                        }}
                    >
                        {formatCurrency(total)}
                    </Text>
                </View>

                <View style={{ flexDirection: "row", gap: spacing[5] }}>
                    <View style={{ alignItems: "flex-end" }}>
                        <Text
                            style={{
                                color: colors.primary,
                                fontSize: 18,
                                fontWeight: "800",
                            }}
                        >
                            {activeDeals}
                        </Text>
                        <Text
                            style={{
                                color: colors.primary + "b0",
                                fontSize: 11,
                                fontWeight: "600",
                            }}
                        >
                            In Escrow
                        </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                        <Text
                            style={{
                                color: colors.accent,
                                fontSize: 18,
                                fontWeight: "800",
                            }}
                        >
                            {totalReviews}
                        </Text>
                        <Text
                            style={{
                                color: colors.accent + "b0",
                                fontSize: 11,
                                fontWeight: "600",
                            }}
                        >
                            Active Deals
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default BalanceCard;