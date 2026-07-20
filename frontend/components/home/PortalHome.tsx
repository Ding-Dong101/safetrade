import { View, Text, FlatList, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useTrades } from "@/hooks/useTrades";
import PortalSwitcher from "@/components/home/PortalSwitcher";
import BalanceCard from "@/components/home/BalanceCard";
import TradeCard from "@/components/trade/TradeCard";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { MOCK_USER } from "@/constants/data";
import { Trade } from "@/types/trade";
import { useEffect } from "react";
import { useRole } from "@/hooks/useRole";

interface PortalHomeProps {
    role: "buyer" | "seller";
}

const PortalHome = ({ role }: PortalHomeProps) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { trades, isLoading } = useTrades();
    const { switchRole } = useRole();
    const { colors, spacing } = useTheme();

    useEffect(() => {
    switchRole(role);
}, [role]);
   

    const handleTradePress = (trade: Trade) => {
        router.push(`/trade/${trade.id}` as any);
    };

    const handleTopUp = () => {
        Alert.alert("Top Up", "Wallet top up is coming soon.");
    };

    const ACTIVE_STATUSES = [
        "CREATED",
        "PENDING",
        "FUNDED",
        "DISPATCH_PENDING",
        "IN_TRANSIT",
        "AT_POST",
    ];
    const activeTrades = trades.filter((t) => ACTIVE_STATUSES.includes(t.status));
    const escrowBalance = activeTrades
        .filter((t) => t.status !== "CREATED" && t.status !== "PENDING")
        .reduce((sum, t) => sum + (t.price ?? 0), 0);
    const availableBalance = user?.balance ?? 0;

    if (isLoading) {
        return <LoadingSpinner message="Loading trades..." />;
    }

    const Header = () => (
        <View style={{ gap: spacing[5], marginBottom: spacing[4] }}>
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
                        fontSize: 24,
                        fontWeight: "800",
                    }}
                >
                    Hello {user?.firstName ?? MOCK_USER.name},
                </Text>
                <PortalSwitcher role={role} />
            </View>

            <BalanceCard
                available={availableBalance}
                total={availableBalance + escrowBalance}
                escrow={escrowBalance}
                activeDeals={activeTrades.length}
                onTopUp={role === "buyer" ? handleTopUp : undefined}
            />

            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 18,
                    fontWeight: "700",
                    textDecorationLine: "underline",
                }}
            >
                Active Trades
            </Text>
        </View>
    );

    return (
        <FlatList
            data={trades}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TradeCard
                    trade={item}
                    role={role}
                    onPress={() => handleTradePress(item)}
                />
            )}
            ListHeaderComponent={<Header />}
            ListEmptyComponent={
                <EmptyState
                    title="No Active Trades"
                    message={
                        role === "buyer"
                            ? "You have no active trades right now. Accept a trade code from a seller to get started."
                            : "You have no active trades right now. Create a trade and share the code with your buyer."
                    }
                />
            }
            contentContainerStyle={{
                paddingHorizontal: spacing[4],
                paddingTop: insets.top + spacing[4],
                paddingBottom: spacing[24],
            }}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: colors.background }}
        />
    );
};

export default PortalHome;
