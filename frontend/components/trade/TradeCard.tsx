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

    const showDirectDeliveryCode = role === "buyer" && trade.status === "IN_TRANSIT" && trade.directDeliveryCode;
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

            {trade.pickupLocation && (
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 12,
                        marginBottom: spacing[1],
                    }}
                    numberOfLines={1}
                >
                    Pickup Location: {trade.pickupLocation}
                </Text>
            )}

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
                    Trade Code: {trade.tradeCode ?? trade.id}
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

            {showDirectDeliveryCode && (
                <View
                    style={{
                        backgroundColor: colors.primary + "18",
                        borderWidth: 1,
                        borderColor: colors.primary + "55",
                        borderRadius: 8,
                        padding: spacing[3],
                        marginBottom: spacing[2],
                    }}
                >
                    <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", marginBottom: 4 }}>
                        DIRECT DELIVERY CODE — give to rider
                    </Text>
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 18,
                            fontWeight: "800",
                            letterSpacing: 1.5,
                            fontVariant: ["tabular-nums"],
                        }}
                        selectable
                    >
                        {trade.directDeliveryCode}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
                        Or let the rider drop off at the post — see post portal for drop-off code.
                    </Text>
                </View>
            )}

            {showPickupCode && (
                <View
                    style={{
                        backgroundColor: colors.accent + "18",
                        borderWidth: 1,
                        borderColor: colors.accent + "55",
                        borderRadius: 8,
                        padding: spacing[3],
                        marginBottom: spacing[2],
                    }}
                >
                    <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", marginBottom: 4 }}>
                        PICK-UP CODE — show at post office
                    </Text>
                    <Text
                        style={{
                            color: colors.accent,
                            fontSize: 18,
                            fontWeight: "800",
                            letterSpacing: 1.5,
                            fontVariant: ["tabular-nums"],
                        }}
                        selectable
                    >
                        {trade.releaseCode}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
                        Your item is at the post office. Show this code to collect it.
                    </Text>
                </View>
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
