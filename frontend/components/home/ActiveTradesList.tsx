import { View, Text, FlatList } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import TradeCard from "@/components/trade/TradeCard";
import EmptyState from "@/components/shared/EmptyState";
import { Trade } from "@/types/trade";

interface ActiveTradesListProps {
    trades: Trade[];
    onTradePress?: (trade: Trade) => void;
    onCreatePress?: () => void;
}

const ActiveTradesList = ({
    trades,
    onTradePress,
    onCreatePress,
}: ActiveTradesListProps) => {
    const { colors, spacing } = useTheme();
    return (
        <View style={{ flex: 1 }}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing[3],
                }}
            >
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 16,
                        fontWeight: "700",
                    }}
                >
                    Active Trades
                </Text>

                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 13,
                    }}
                >
                    {trades.length} total
                </Text>
            </View>

            {trades.length === 0 ? (
                <EmptyState
                    title="No Active Trades"
                    message="You have no active trades right now. Start by creating a new trade."
                    actionLabel="New Trade"
                    onAction={onCreatePress}
                />
            ) : (
                <FlatList
                    data={trades}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TradeCard
                            trade={item}
                            onPress={() => onTradePress?.(item)}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default ActiveTradesList;