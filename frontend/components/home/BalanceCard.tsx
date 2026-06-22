import { View, Text } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { formatCurrency } from "@/utils/formatCurrency";

interface BalanceCardProps {
    available: number;
    total: number;
    activeDeals?: number;
    totalReviews?: number;
}

const BalanceCard = ({
    available,
    total,
    activeDeals = 0,
    totalReviews = 0,
}: BalanceCardProps) => {
    return (
        <View
            style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: spacing[5],
                borderWidth: 1,
                borderColor: colors.border,
                gap: spacing[4],
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <View>
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 12,
                            marginBottom: 4,
                        }}
                    >
                        Available
                    </Text>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 22,
                            fontWeight: "700",
                        }}
                    >
                        {formatCurrency(available)}
                    </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 12,
                            marginBottom: 4,
                        }}
                    >
                        Total
                    </Text>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 22,
                            fontWeight: "700",
                        }}
                    >
                        {formatCurrency(total)}
                    </Text>
                </View>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    gap: spacing[4],
                }}
            >
                <View>
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 16,
                            fontWeight: "700",
                        }}
                    >
                        {activeDeals}
                    </Text>
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 11,
                        }}
                    >
                        In Escrow
                    </Text>
                </View>

                <View>
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 16,
                            fontWeight: "700",
                        }}
                    >
                        {totalReviews}
                    </Text>
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 11,
                        }}
                    >
                        Active Deals
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default BalanceCard;