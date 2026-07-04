import { View, Text, FlatList } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import ScreenHeader from "@/components/shared/ScreenHeader";
import TradeCard from "@/components/trade/TradeCard";
import EmptyState from "@/components/shared/EmptyState";
import { Trade } from "@/types/trade";
import { MOCK_TRADES } from "@/constants/data";

export default function AdminTrades() {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title="All Trades" />

            <FlatList
                data={MOCK_TRADES as unknown as Trade[]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TradeCard
                        trade={item}
                        onPress={() => console.log("trade pressed", item.id)}
                    />
                )}
                ListHeaderComponent={
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
                            All Trades
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 13 }}>
                            {MOCK_TRADES.length} total
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <EmptyState
                        title="No Trades"
                        message="There are no trades on the platform yet."
                    />
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