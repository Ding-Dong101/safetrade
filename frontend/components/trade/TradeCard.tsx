import { View, Text } from "react-native";
import Card from "@/components/ui/Card";
import TradeStatusBadge from "./TradeStatusBadge";
import TradeStatusBar from "./TradeStatusBar";
import { colors, spacing } from "@/constants/theme";
import { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatRelativeTime } from "@/utils/formatDate";

interface TradeCardProps {
    trade: Trade;
    onPress?: () => void;
}

const TradeCard = ({ trade, onPress }: TradeCardProps) => {
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
                    }}
                >
                    {trade.buyerId ? `Buyer ${trade.buyerId.substring(0, 8)}` : "Unknown Buyer"}
                </Text>
                <TradeStatusBadge status={trade.status} />
            </View>

            <Text
                style={{
                    color: colors.primary,
                    fontSize: 18,
                    fontWeight: "700",
                    marginBottom: spacing[1],
                }}
            >
                {formatCurrency(trade.price)}
            </Text>

            {trade.description && (
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 13,
                        marginBottom: spacing[2],
                    }}
                    numberOfLines={2}
                >
                    {trade.description}
                </Text>
            )}

            <Text
                style={{
                    color: colors.mutedForeground,
                    fontSize: 11,
                    marginBottom: spacing[1],
                }}
            >
                {formatRelativeTime(trade.createdAt)}
            </Text>

            <TradeStatusBar status={trade.status} />
        </Card>
    );
};

export default TradeCard;