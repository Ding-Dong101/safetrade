import { View, Text } from "react-native";
import Card from "@/components/ui/Card";
import TradeStatusBadge from "./TradeStatusBadge";
import TradeStatusBar from "./TradeStatusBar";
import { useTheme } from "@/hooks/useTheme";
import { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/formatCurrency";
import { Role } from "@/types/auth";

interface TradeCardProps {
    trade: Trade;
    role?: Role;
    onPress?: () => void;
}

const TradeCard = ({ trade, role = "buyer", onPress }: TradeCardProps) => {
    const { colors, spacing } = useTheme();

    const showPickupCode = role === "buyer" && trade.status === "AT_POST" && trade.releaseCode;
    const showDispatchCode = role === "seller" && trade.status === "DISPATCH_PENDING" && trade.dispatchCode;
    const pendingVerification = trade.status === "FUNDED";

    return (
        <Card onPress={onPress} style={{ marginBottom: spacing[3] }}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing[2],
                }}
            >
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 15,
                        fontWeight: "600",
                        flex: 1,
                        marginRight: spacing[2],
                    }}
                    numberOfLines={1}
                >
                    {trade.title ?? "Trade"}
                </Text>
                <TradeStatusBadge status={trade.status} />
            </View>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing[2],
                }}
            >
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 12,
                        flex: 1,
                        marginRight: spacing[2],
                    }}
                    numberOfLines={1}
                >
                    ID: {trade.id}
                </Text>
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 18,
                        fontWeight: "700",
                        fontVariant: ["tabular-nums"],
                    }}
                >
                    {formatCurrency(trade.price)}
                </Text>
            </View>

            {showPickupCode && (
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 13,
                        fontWeight: "600",
                        marginBottom: spacing[1],
                    }}
                >
                    Pick-Up Code: {trade.releaseCode}
                </Text>
            )}

            {showDispatchCode && (
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 13,
                        fontWeight: "600",
                        marginBottom: spacing[1],
                    }}
                >
                    Dispatch Code: {trade.dispatchCode}
                </Text>
            )}

            {pendingVerification && (
                <Text
                    style={{
                        color: colors.accent,
                        fontSize: 12,
                        fontWeight: "600",
                        marginBottom: spacing[1],
                    }}
                >
                    Pending Photo Verification.
                </Text>
            )}

            {trade.description && (
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 13,
                        marginBottom: spacing[1],
                    }}
                    numberOfLines={2}
                >
                    {trade.description}
                </Text>
            )}

            <TradeStatusBar status={trade.status} />
        </Card>
    );
};

export default TradeCard;
