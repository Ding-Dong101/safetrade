import { View, Text, FlatList, Alert, Platform, Linking } from "react-native";
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
import api from "@/services/api";
import Toast from "react-native-toast-message";

interface PortalHomeProps {
    role: "buyer" | "seller";
}

const PortalHome = ({ role }: PortalHomeProps) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, token, setUser } = useAuth();
    const { trades, isLoading } = useTrades();
    const { switchRole } = useRole();
    const { colors, spacing } = useTheme();

    useEffect(() => {
    switchRole(role);
}, [role]);
   

    const handleTradePress = (trade: Trade) => {
        router.push(`/trade/${trade.id}` as any);
    };

    const processTopUp = async (amount: number) => {
        try {
            const { data: initData } = await api.post("/users/topup/initialize", { amount });
            
            const parsedInit = typeof initData === "string" ? JSON.parse(initData) : initData;
            const authUrl = parsedInit?.data?.authorization_url;
            const reference = parsedInit?.data?.reference;

            if (!authUrl || !reference) {
                Toast.show({ type: "error", text1: "Failed to initialize top up" });
                return;
            }

            await Linking.openURL(authUrl);

            if (Platform.OS === "web") {
                const confirmed = window.confirm("Click OK after you have completed the payment in the new tab.");
                if (confirmed) {
                    verifyTopUp(reference);
                }
            } else {
                Alert.alert(
                    "Complete Payment",
                    "Complete payment in your browser, then return here and tap 'Confirm Payment'.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Confirm Payment", onPress: () => verifyTopUp(reference) }
                    ]
                );
            }
        } catch (error: any) {
            Toast.show({ type: "error", text1: "Top up failed", text2: error.message });
        }
    };

    const verifyTopUp = async (reference: string) => {
        try {
            const { data } = await api.post("/users/topup/verify", { reference });
            if (data && token) {
                setUser(data, token);
                Toast.show({ type: "success", text1: "Top up successful!" });
            }
        } catch (error: any) {
            Toast.show({ type: "error", text1: "Verification failed", text2: error?.response?.data || error.message });
        }
    };

    const handleTopUp = () => {
        if (Platform.OS === "web") {
            const amountStr = window.prompt("Enter amount to top up (e.g. 100):");
            if (amountStr) {
                const amount = parseFloat(amountStr);
                if (!isNaN(amount) && amount > 0) {
                    processTopUp(amount);
                } else {
                    Toast.show({ type: "error", text1: "Invalid amount" });
                }
            }
        } else {
            Alert.prompt(
                "Top Up Wallet",
                "Enter amount to top up:",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Top Up", 
                        onPress: (amountStr) => {
                            const amount = parseFloat(amountStr || "");
                            if (!isNaN(amount) && amount > 0) {
                                processTopUp(amount);
                            } else {
                                Toast.show({ type: "error", text1: "Invalid amount" });
                            }
                        }
                    }
                ],
                "plain-text",
                "",
                "numeric"
            );
        }
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

    return (
        <View style={{ flex: 1, backgroundColor: colors.primary }}>
            <View
                style={{
                    paddingHorizontal: spacing[5],
                    paddingTop: insets.top + spacing[6],
                    paddingBottom: spacing[6],
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: spacing[6]
                    }}
                >
                    <Text
                        style={{
                            color: "#ffffff",
                            fontSize: 28,
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
            </View>

            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    paddingTop: spacing[6],
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 16,
                    elevation: 10,
                }}
            >
                <Text
                    style={{
                        marginHorizontal: spacing[6],
                        marginBottom: spacing[4],
                        color: colors.foreground,
                        fontSize: 18,
                        fontWeight: "700",
                    }}
                >
                    Active Trades
                </Text>
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
                        paddingHorizontal: spacing[5],
                        paddingBottom: spacing[24],
                    }}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
};

export default PortalHome;
