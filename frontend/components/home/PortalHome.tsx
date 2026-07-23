import { View, Text, FlatList, Alert, Platform, Linking, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
import { useEffect, useState } from "react";
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

    const [isTopUpModalVisible, setIsTopUpModalVisible] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState("");
    const [isInitializing, setIsInitializing] = useState(false);
    const [pendingTopUpRef, setPendingTopUpRef] = useState<string | null>(null);

    useEffect(() => {
        switchRole(role);
    }, [role]);

    const handleTradePress = (trade: Trade) => {
        router.push(`/trade/${trade.id}` as any);
    };

    const processTopUp = async (amount: number) => {
        try {
            setIsInitializing(true);
            const { data: initData } = await api.post("/users/topup/initialize", { amount });

            const parsedInit = typeof initData === "string" ? JSON.parse(initData) : initData;
            const authUrl = parsedInit?.data?.authorization_url;
            const reference = parsedInit?.data?.reference;

            if (!authUrl || !reference) {
                Toast.show({ type: "error", text1: "Failed to initialize top up" });
                return;
            }

            setPendingTopUpRef(reference);
            setIsTopUpModalVisible(false);
            setTopUpAmount("");
            await Linking.openURL(authUrl);

            if (Platform.OS === "web") {
                const confirmed = window.confirm("Click OK after completing payment on Paystack to verify and update your balance.");
                if (confirmed) {
                    verifyTopUp(reference);
                }
            } else {
                Alert.alert(
                    "Complete Payment",
                    "Complete payment in your browser, then return here and tap 'Confirm Payment' to update your balance.",
                    [
                        { text: "Later", style: "cancel" },
                        { text: "Confirm Payment", onPress: () => verifyTopUp(reference) }
                    ]
                );
            }
        } catch (error: any) {
            Toast.show({ type: "error", text1: "Top up failed", text2: error.message });
        } finally {
            setIsInitializing(false);
        }
    };

    const verifyTopUp = async (reference: string) => {
        try {
            const { data } = await api.post("/users/topup/verify", { reference });
            if (data && token) {
                setUser(data, token);
                setPendingTopUpRef(null);
                Toast.show({ type: "success", text1: "Top up successful!", text2: "Account balance updated." });
            }
        } catch (error: any) {
            Toast.show({ type: "error", text1: "Verification failed", text2: error?.response?.data || error.message });
        }
    };

    const handleSubmitTopUp = () => {
        const amount = parseFloat(topUpAmount.trim());
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid amount to top up.");
            return;
        }
        processTopUp(amount);
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
                    onTopUp={() => setIsTopUpModalVisible(true)}
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
                {pendingTopUpRef && (
                    <TouchableOpacity
                        onPress={() => verifyTopUp(pendingTopUpRef)}
                        activeOpacity={0.8}
                        style={{
                            marginHorizontal: spacing[6],
                            marginBottom: spacing[4],
                            backgroundColor: `${colors.primary}18`,
                            borderWidth: 1.5,
                            borderColor: colors.primary,
                            borderRadius: 14,
                            padding: spacing[4],
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <View style={{ flex: 1, paddingRight: spacing[2] }}>
                            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>
                                Payment Pending Verification
                            </Text>
                            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                                Completed payment on Paystack? Tap here to credit your balance.
                            </Text>
                        </View>
                        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}>
                            <Text style={{ color: colors.background, fontSize: 12, fontWeight: "700" }}>
                                Verify Now
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

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
                        paddingBottom: insets.bottom + 140,
                    }}
                    showsVerticalScrollIndicator={true}
                />
            </View>

            {/* Top-Up Submenu Modal */}
            <Modal visible={isTopUpModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <View
                        style={{
                            backgroundColor: colors.background,
                            padding: spacing[6],
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                        }}
                    >
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[4] }}>
                            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "700" }}>Top-Up</Text>
                            <TouchableOpacity onPress={() => setIsTopUpModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.foreground} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: colors.muted, fontSize: 13, marginBottom: spacing[4] }}>
                            Enter the amount you wish to add to your SafeTrade wallet via Paystack.
                        </Text>

                        {/* Quick Presets */}
                        <View style={{ flexDirection: "row", gap: spacing[2], marginBottom: spacing[4] }}>
                            {[50, 100, 200, 500].map((preset) => (
                                <TouchableOpacity
                                    key={preset}
                                    onPress={() => setTopUpAmount(preset.toString())}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: topUpAmount === preset.toString() ? colors.primary : colors.border,
                                        backgroundColor: topUpAmount === preset.toString() ? `${colors.primary}18` : colors.card,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ color: topUpAmount === preset.toString() ? colors.primary : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                                        GHS {preset}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={{ color: colors.muted, marginBottom: 8, fontSize: 14 }}>Amount (GHS)</Text>
                        <TextInput
                            value={topUpAmount}
                            onChangeText={setTopUpAmount}
                            placeholder="e.g. 100"
                            keyboardType="numeric"
                            placeholderTextColor={colors.muted}
                            style={{
                                backgroundColor: colors.card,
                                color: colors.foreground,
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: spacing[6],
                                borderWidth: 1,
                                borderColor: colors.border,
                                fontSize: 16,
                                fontWeight: "600",
                            }}
                        />

                        <TouchableOpacity
                            onPress={handleSubmitTopUp}
                            disabled={isInitializing}
                            style={{
                                backgroundColor: colors.primary,
                                padding: 16,
                                borderRadius: 12,
                                alignItems: "center",
                            }}
                        >
                            {isInitializing ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={{ color: colors.background, fontWeight: "700", fontSize: 16 }}>
                                    Top-Up
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

export default PortalHome;
