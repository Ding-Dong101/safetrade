import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";

interface BalanceCardProps {
    available: number;
    total: number;
    escrow?: number;
    activeDeals?: number;
    onTopUp?: () => void;
}

const BalanceCard = ({
    available,
    total,
    escrow,
    activeDeals = 0,
    onTopUp,
}: BalanceCardProps) => {
    const { colors, spacing } = useTheme();

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
                    alignItems: "flex-start",
                    gap: spacing[3],
                }}
            >
                <View style={{ flex: 1 }}>
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
                        Available
                    </Text>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 24,
                            fontWeight: "800",
                            fontVariant: ["tabular-nums"],
                        }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {formatCurrency(available)}
                    </Text>
                </View>

                <View style={{ flex: 1, alignItems: "flex-end" }}>
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
                        Total
                    </Text>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 24,
                            fontWeight: "800",
                            fontVariant: ["tabular-nums"],
                        }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {formatCurrency(total)}
                    </Text>
                </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <View>
                    {escrow !== undefined && (
                        <Text
                            style={{
                                color: colors.primary,
                                fontSize: 13,
                                fontWeight: "700",
                            }}
                        >
                            {formatCurrency(escrow)}{" "}
                            <Text style={{ color: colors.muted, fontWeight: "500" }}>
                                in escrow
                            </Text>
                        </Text>
                    )}
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 13,
                            marginTop: 2,
                        }}
                    >
                        <Text style={{ color: colors.foreground, fontWeight: "700" }}>
                            {activeDeals}
                        </Text>{" "}
                        Active Deals
                    </Text>
                </View>

                {onTopUp && (
                    <TouchableOpacity
                        onPress={onTopUp}
                        activeOpacity={0.7}
                        style={{
                            backgroundColor: colors.primary,
                            paddingHorizontal: spacing[4],
                            paddingVertical: spacing[2],
                            borderRadius: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <Ionicons name="add" size={16} color={colors.background} />
                        <Text
                            style={{
                                color: colors.background,
                                fontSize: 13,
                                fontWeight: "700",
                            }}
                        >
                            Top Up
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default BalanceCard;
