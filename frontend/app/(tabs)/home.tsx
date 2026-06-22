import { View, Text, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { useTrades } from "@/hooks/useTrades";
import PortalBadge from "@/components/home/PortalBadge";
import BalanceCard from "@/components/home/BalanceCard";
import TradeCard from "@/components/trade/TradeCard";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { MOCK_USER } from "@/constants/data";
import { Trade } from "@/types/trade";

export default function Home() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { activeRole } = useRole();
    const { user } = useAuth();
    const { trades, isLoading } = useTrades();

    const handleTradePress = (trade: Trade) => {
        router.push(`/trade/${trade.id}` as any);
    };

    const handleCreatePress = () => {
        router.push("/(tabs)/new" as any);
    };

    if (isLoading) {
        return <LoadingSpinner message="Loading trades..." />;
    }

    const Header = () => (
        <View style={{ gap: spacing[5] }}>
            {/* Header */}
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
                            fontSize: 13,
                        }}
                    >
                        Welcome back,
                    </Text>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 22,
                            fontWeight: "700",
                        }}
                    >
                        {user?.firstName ?? MOCK_USER.name}
                    </Text>
                </View>
                <PortalBadge role={activeRole} />
            </View>

            {/* Balance */}
            <BalanceCard
                available={MOCK_USER.availableBalance}
                total={MOCK_USER.totalBalance}
                activeDeals={MOCK_USER.activeDeals}
                totalReviews={MOCK_USER.totalReviews}
            />

            {/* Section Title */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                    {trades.length} total
                </Text>
            </View>
        </View>
    );

    return (
        <FlatList
            data={trades}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TradeCard
                    trade={item}
                    onPress={() => handleTradePress(item)}
                />
            )}
            ListHeaderComponent={<Header />}
            ListEmptyComponent={
                <EmptyState
                    title="No Active Trades"
                    message="You have no active trades right now. Start by creating a new trade."
                    actionLabel="New Trade"
                    onAction={handleCreatePress}
                />
            }
            contentContainerStyle={{
                paddingHorizontal: spacing[4],
                paddingTop: insets.top + spacing[4],
                paddingBottom: spacing[20],
                gap: spacing[4],
            }}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: colors.background }}
        />
    );
}