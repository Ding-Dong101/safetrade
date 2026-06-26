import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ScrollView, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { useTrades } from "@/hooks/useTrades";
import BalanceCard from "@/components/home/BalanceCard";
import TradeCard from "@/components/trade/TradeCard";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Trade } from "@/types/trade";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
    depositFunds,
    verifyTradePhoto,
    confirmRiderPickup,
    confirmPostDropoff,
    confirmBuyerCollect
} from "@/services/tradeService";

export default function Home() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { activeRole, switchRole } = useRole();
    const { user } = useAuth();
    const { trades, isLoading, refetch } = useTrades();

    // Local States
    const [menuOpen, setMenuOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Modal states for user actions
    const [codeModalVisible, setCodeModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        placeholder: string;
        onSubmit: (val: string) => Promise<void>;
    } | null>(null);
    const [codeInputValue, setCodeInputValue] = useState("");

    // Rider tab selection: "ongoing" | "available"
    const [riderTab, setRiderTab] = useState<"ongoing" | "available">("ongoing");
    
    // Search filter for Post Operator
    const [postSearch, setPostSearch] = useState("");

    // Auto redirect to sign-in if not logged in
    useEffect(() => {
        if (!user && !isLoading) {
            router.replace("/(auth)/sign-in" as any);
        }
    }, [user, isLoading]);

    const handleOpenCodeModal = (title: string, placeholder: string, onSubmit: (val: string) => Promise<void>) => {
        setModalConfig({ title, placeholder, onSubmit });
        setCodeInputValue("");
        setCodeModalVisible(true);
    };

    const handleModalSubmit = async () => {
        if (!codeInputValue.trim() || !modalConfig) return;
        setCodeModalVisible(false);
        setActionLoading(true);
        try {
            await modalConfig.onSubmit(codeInputValue.trim());
            Alert.alert("Success", "Action completed successfully");
            refetch();
        } catch (err: any) {
            Alert.alert("Error", err?.response?.data ?? "Action failed. Please verify the code.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeposit = async (tradeId: string) => {
        setActionLoading(true);
        try {
            await depositFunds(tradeId);
            Alert.alert("Success", "Escrow funded successfully");
            refetch();
        } catch (err: any) {
            Alert.alert("Error", err?.response?.data ?? "Deposit failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyPhoto = async (tradeId: string) => {
        setActionLoading(true);
        try {
            // Simulate capturing live photo base64
            const simulatedBase64 = "data:image/png;base64,iVBORw0KGgoAAAANS=";
            await verifyTradePhoto(tradeId, simulatedBase64);
            Alert.alert("Success", "Photo verified! Dispatch code generated.");
            refetch();
        } catch (err: any) {
            Alert.alert("Error", err?.response?.data ?? "Verification failed");
        } finally {
            setActionLoading(false);
        }
    };

    // Filter trades based on dynamic role views
    const filteredTrades = trades.filter((trade) => {
        if (activeRole === "buyer") {
            // Buyer is authenticated user
            return true; 
        } else if (activeRole === "seller") {
            return true;
        } else if (activeRole === "rider") {
            const statusLower = trade.status.toLowerCase();
            if (riderTab === "available") {
                return statusLower === "dispatch_pending" || statusLower === "photo_verified";
            } else {
                return statusLower === "in_transit";
            }
        } else if (activeRole === "post") {
            const statusLower = trade.status.toLowerCase();
            const matchesStatus = statusLower === "in_transit" || statusLower === "at_post" || statusLower === "delivered";
            if (!matchesStatus) return false;
            if (!postSearch.trim()) return true;
            return (
                trade.id.includes(postSearch) ||
                trade.buyerUsername.toLowerCase().includes(postSearch.toLowerCase()) ||
                trade.sellerUsername.toLowerCase().includes(postSearch.toLowerCase())
            );
        }
        return true;
    });

    const handleCreatePress = () => {
        router.push("/(tabs)/new" as any);
    };

    // Header switcher component matching designs
    const Header = () => {
        const roleLabels: Record<typeof activeRole, string> = {
            buyer: "Buyer Portal",
            seller: "Seller Portal",
            rider: "Rider Portal",
            post: "Post Operator",
        };

        const roleColors: Record<typeof activeRole, string> = {
            buyer: colors.primary,
            seller: colors.purple,
            rider: colors.accent,
            post: colors.info,
        };

        return (
            <View style={{ gap: spacing[4], marginBottom: spacing[2], zIndex: 10 }}>
                {/* Switcher & Title */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <View>
                        <Text style={{ color: colors.muted, fontSize: 13 }}>Portal</Text>
                        <TouchableOpacity
                            onPress={() => setMenuOpen(!menuOpen)}
                            activeOpacity={0.7}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                marginTop: 2,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.foreground,
                                    fontSize: 20,
                                    fontWeight: "800",
                                }}
                            >
                                {roleLabels[activeRole]}
                            </Text>
                            <Ionicons
                                name={menuOpen ? "chevron-up" : "chevron-down"}
                                size={18}
                                color={colors.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Quick indicator badge */}
                    <View
                        style={{
                            backgroundColor: roleColors[activeRole] + "20",
                            borderWidth: 1,
                            borderColor: roleColors[activeRole] + "40",
                            paddingHorizontal: 12,
                            paddingVertical: 5,
                            borderRadius: 12,
                        }}
                    >
                        <Text
                            style={{
                                color: roleColors[activeRole],
                                fontSize: 11,
                                fontWeight: "700",
                                textTransform: "uppercase",
                            }}
                        >
                            Active
                        </Text>
                    </View>
                </View>

                {/* Dropdown Menu Overlay */}
                {menuOpen && (
                    <View
                        style={{
                            position: "absolute",
                            top: 50,
                            left: 0,
                            right: 0,
                            backgroundColor: colors.card,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: colors.border,
                            padding: spacing[2],
                            zIndex: 100,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.25,
                            shadowRadius: 16,
                            elevation: 8,
                        }}
                    >
                        {(["buyer", "seller", "rider", "post"] as const).map((r) => (
                            <TouchableOpacity
                                key={r}
                                onPress={() => {
                                    switchRole(r);
                                    setMenuOpen(false);
                                }}
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: spacing[3],
                                    borderRadius: 10,
                                    backgroundColor: activeRole === r ? colors.primary + "10" : "transparent",
                                }}
                            >
                                <Text
                                    style={{
                                        color: activeRole === r ? colors.primary : colors.foreground,
                                        fontSize: 15,
                                        fontWeight: activeRole === r ? "700" : "500",
                                    }}
                                >
                                    {roleLabels[r]}
                                </Text>
                                {activeRole === r && (
                                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Balance Summary Card */}
                {activeRole === "buyer" && (
                    <BalanceCard
                        available={user ? 1250.00 : 0}
                        total={user ? 4500.00 : 0}
                        activeDeals={filteredTrades.length}
                        totalReviews={4}
                        onTopUp={() => Alert.alert("Top Up", "Simulated Paystack gateway top-up.")}
                    />
                )}
                {activeRole === "seller" && (
                    <BalanceCard
                        available={user ? 3200.00 : 0}
                        total={user ? 3200.00 : 0}
                        activeDeals={filteredTrades.length}
                        totalReviews={8}
                    />
                )}

                {/* Portal Specific View Switchers/Tabs */}
                {activeRole === "rider" && (
                    <View
                        style={{
                            flexDirection: "row",
                            backgroundColor: colors.card,
                            borderRadius: 12,
                            padding: 4,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => setRiderTab("ongoing")}
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                alignItems: "center",
                                borderRadius: 8,
                                backgroundColor: riderTab === "ongoing" ? colors.accent : "transparent",
                            }}
                        >
                            <Text
                                style={{
                                    color: riderTab === "ongoing" ? "#000" : colors.muted,
                                    fontWeight: "700",
                                    fontSize: 14,
                                }}
                            >
                                Ongoing Deliveries
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setRiderTab("available")}
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                alignItems: "center",
                                borderRadius: 8,
                                backgroundColor: riderTab === "available" ? colors.accent : "transparent",
                            }}
                        >
                            <Text
                                style={{
                                    color: riderTab === "available" ? "#000" : colors.muted,
                                    fontWeight: "700",
                                    fontSize: 14,
                                }}
                            >
                                Available Jobs
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {activeRole === "post" && (
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: colors.card,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        <Ionicons name="search" size={18} color={colors.muted} style={{ marginRight: 8 }} />
                        <TextInput
                            placeholder="Search by Trade ID, Buyer, Seller..."
                            placeholderTextColor={colors.mutedForeground}
                            value={postSearch}
                            onChangeText={setPostSearch}
                            style={{
                                color: colors.foreground,
                                fontSize: 14,
                                flex: 1,
                            }}
                        />
                    </View>
                )}

                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 16,
                        fontWeight: "700",
                        marginTop: spacing[2],
                    }}
                >
                    {activeRole === "post" ? "SafeTrade Hub Desk" : "Active Transactions"}
                </Text>
            </View>
        );
    };

    if (isLoading || actionLoading) {
        return <LoadingSpinner message="Processing transactions..." />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FlatList
                data={filteredTrades}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const statusLower = item.status.toLowerCase();
                    return (
                        <View style={{ marginBottom: spacing[3] }}>
                            <TradeCard
                                trade={item}
                                onPress={() => router.push(`/trade/${item.id}` as any)}
                            />
                            
                            {/* Interactive Contextual Actions */}
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    borderBottomLeftRadius: 12,
                                    borderBottomRightRadius: 12,
                                    borderWidth: 1,
                                    borderTopWidth: 0,
                                    borderColor: colors.border,
                                    padding: spacing[3],
                                    marginTop: -spacing[4],
                                    marginBottom: spacing[2],
                                    flexDirection: "row",
                                    justifyContent: "flex-end",
                                    gap: spacing[2],
                                }}
                            >
                                {activeRole === "buyer" && statusLower === "pending" && (
                                    <TouchableOpacity
                                        onPress={() => handleDeposit(item.id)}
                                        style={{
                                            backgroundColor: colors.primary,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 8,
                                        }}
                                    >
                                        <Text style={{ color: "#000", fontWeight: "700", fontSize: 13 }}>
                                            Deposit Funds
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {activeRole === "buyer" && (statusLower === "at_post" || statusLower === "delivered") && (
                                    <TouchableOpacity
                                        onPress={() => handleOpenCodeModal(
                                            "Release Funds",
                                            "Enter Release Code (OTP)",
                                            async (code) => { await confirmBuyerCollect(item.id, code); }
                                        )}
                                        style={{
                                            backgroundColor: colors.primary,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 8,
                                        }}
                                    >
                                        <Text style={{ color: "#000", fontWeight: "700", fontSize: 13 }}>
                                            Collect & Release
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {activeRole === "seller" && statusLower === "funded" && (
                                    <TouchableOpacity
                                        onPress={() => handleVerifyPhoto(item.id)}
                                        style={{
                                            backgroundColor: colors.purple,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 8,
                                        }}
                                    >
                                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                                            Verify Photo
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {activeRole === "seller" && (statusLower === "dispatch_pending" || statusLower === "photo_verified") && item.dispatchCode && (
                                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        <Text style={{ color: colors.muted, fontSize: 12 }}>
                                            Handover OTP to Rider:
                                        </Text>
                                        <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 14 }}>
                                            {item.dispatchCode}
                                        </Text>
                                    </View>
                                )}

                                {activeRole === "rider" && (statusLower === "dispatch_pending" || statusLower === "photo_verified") && (
                                    <TouchableOpacity
                                        onPress={() => handleOpenCodeModal(
                                            "Accept Dispatch Job",
                                            "Enter Handover OTP",
                                            async (code) => { await confirmRiderPickup(item.id, user?.id ?? "rider-1", code); }
                                        )}
                                        style={{
                                            backgroundColor: colors.accent,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 8,
                                        }}
                                    >
                                        <Text style={{ color: "#000", fontWeight: "700", fontSize: 13 }}>
                                            Accept & Pickup
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {activeRole === "rider" && statusLower === "in_transit" && (
                                    <TouchableOpacity
                                        onPress={() => handleOpenCodeModal(
                                            "Drop off at Post",
                                            "Enter Post Drop-off Code",
                                            async (code) => { await confirmPostDropoff(item.id, code); }
                                        )}
                                        style={{
                                            backgroundColor: colors.accent,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 8,
                                        }}
                                    >
                                        <Text style={{ color: "#000", fontWeight: "700", fontSize: 13 }}>
                                            Confirm Dropoff
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {activeRole === "post" && statusLower === "in_transit" && (
                                    <TouchableOpacity
                                        onPress={() => handleOpenCodeModal(
                                            "Post Center Arrival",
                                            "Enter Drop-off Verification Code",
                                            async (code) => { await confirmPostDropoff(item.id, code); }
                                        )}
                                        style={{
                                            backgroundColor: colors.info,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 8,
                                        }}
                                    >
                                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                                            Verify Dropoff
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {activeRole === "post" && (statusLower === "at_post" || statusLower === "delivered") && (
                                    <TouchableOpacity
                                        onPress={() => handleOpenCodeModal(
                                            "Release Package to Buyer",
                                            "Enter Release Code",
                                            async (code) => { await confirmBuyerCollect(item.id, code); }
                                        )}
                                        style={{
                                            backgroundColor: colors.info,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 8,
                                        }}
                                    >
                                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                                            Verify Release
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                }}
                ListHeaderComponent={<Header />}
                ListEmptyComponent={
                    <EmptyState
                        title="No Portal Transactions"
                        message="There are no active trades matching this portal view."
                        actionLabel={activeRole === "buyer" ? "New Trade" : undefined}
                        onAction={activeRole === "buyer" ? handleCreatePress : undefined}
                    />
                }
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: insets.top + spacing[4],
                    paddingBottom: spacing[24],
                }}
                showsVerticalScrollIndicator={false}
            />

            {/* Standard Verification OTP Input Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={codeModalVisible}
                onRequestClose={() => setCodeModalVisible(false)}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.65)",
                        padding: spacing[5],
                    }}
                >
                    <View
                        style={{
                            backgroundColor: colors.card,
                            borderRadius: 20,
                            padding: spacing[6],
                            width: "100%",
                            maxWidth: 340,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 18,
                                fontWeight: "800",
                                marginBottom: spacing[2],
                                textAlign: "center",
                            }}
                        >
                            {modalConfig?.title}
                        </Text>
                        
                        <TextInput
                            placeholder={modalConfig?.placeholder}
                            placeholderTextColor={colors.mutedForeground}
                            value={codeInputValue}
                            onChangeText={setCodeInputValue}
                            autoCapitalize="characters"
                            style={{
                                backgroundColor: colors.background,
                                color: colors.foreground,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: colors.border,
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                fontSize: 16,
                                fontWeight: "700",
                                textAlign: "center",
                                letterSpacing: 2,
                                marginVertical: spacing[4],
                            }}
                        />

                        <View style={{ flexDirection: "row", gap: spacing[3] }}>
                            <TouchableOpacity
                                onPress={() => setCodeModalVisible(false)}
                                style={{
                                    flex: 1,
                                    backgroundColor: colors.cardAlt,
                                    borderRadius: 10,
                                    paddingVertical: 12,
                                    alignItems: "center",
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                }}
                            >
                                <Text style={{ color: colors.muted, fontWeight: "600" }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleModalSubmit}
                                style={{
                                    flex: 1,
                                    backgroundColor: colors.primary,
                                    borderRadius: 10,
                                    paddingVertical: 12,
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: "#000", fontWeight: "700" }}>Verify</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}