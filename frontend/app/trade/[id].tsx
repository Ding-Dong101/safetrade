import { View, Text, ScrollView, Alert, TouchableOpacity, Image, Modal } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/useTheme";
import { useTrades } from "@/hooks/useTrades";
import { useAuth } from "@/hooks/useAuth";
import { depositFunds, verifyPayment, sellerUpload, buyerConfirmRiderDelivery, cancelTrade } from "@/services/tradeService";
import * as Linking from "expo-linking";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import ScreenHeader from "@/components/shared/ScreenHeader";
import TradeStatusBadge from "@/components/trade/TradeStatusBadge";
import TradeStatusBar from "@/components/trade/TradeStatusBar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDate";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import ShareDealModal from "@/components/trade/ShareDealModal";
import { getUserById } from "@/services/userService";

const getErrorMessage = (err: any): string => {
    if (typeof err?.response?.data === "string") return err.response.data;
    if (typeof err?.response?.data?.message === "string") return err.response.data.message;
    if (typeof err?.response?.data?.error === "string") return err.response.data.error;
    if (typeof err?.message === "string") return err.message;
    return "An unexpected error occurred. Please try again.";
};

export default function TradeDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { selectedTrade, isLoading, fetchTradeById, refetch } = useTrades();
    const { user } = useAuth();
    const [isActing, setIsActing] = useState(false);
    const [riderCodeInput, setRiderCodeInput] = useState("");
    const [buyerName, setBuyerName] = useState<string>("");
    const [sellerName, setSellerName] = useState<string>("");
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchTradeById(id);

        const interval = setInterval(() => {
            fetchTradeById(id);
        }, 6000);

        return () => clearInterval(interval);
    }, [id]);

    const handleCancelTrade = () => {
        if (!selectedTrade) return;
        const isFunded = selectedTrade.status === "FUNDED" || selectedTrade.status === "DISPATCH_PENDING";
        const msg = isFunded
            ? "Are you sure you want to cancel this trade? Funds will be refunded to the buyer via Paystack."
            : "Are you sure you want to cancel this trade?";

        Alert.alert("Cancel Trade", msg, [
            { text: "Keep Trade", style: "cancel" },
            {
                text: "Cancel Trade",
                style: "destructive",
                onPress: async () => {
                    try {
                        setIsActing(true);
                        await cancelTrade(selectedTrade.id);
                        await fetchTradeById(selectedTrade.id);
                        await refetch();
                        Alert.alert(
                            "Trade Cancelled",
                            isFunded
                                ? "The trade has been cancelled and funds refunded to the buyer."
                                : "The trade has been cancelled."
                        );
                    } catch (err: any) {
                        Alert.alert("Cancel Failed", getErrorMessage(err));
                    } finally {
                        setIsActing(false);
                    }
                },
            },
        ]);
    };

    useEffect(() => {
        if (!selectedTrade) return;
        if (selectedTrade.buyerId) {
            getUserById(selectedTrade.buyerId).then((u) => setBuyerName(u?.username ?? selectedTrade.buyerId));
        }
        if (selectedTrade.sellerId) {
            getUserById(selectedTrade.sellerId).then((u) => setSellerName(u?.username ?? selectedTrade.sellerId));
        }
    }, [selectedTrade?.buyerId, selectedTrade?.sellerId]);

    const isBuyer = user?.id === selectedTrade?.buyerId;
    const isSeller = user?.id === selectedTrade?.sellerId;

    const handleDeposit = async () => {
        if (!selectedTrade) return;
        try {
            setIsActing(true);
            const { authorizationUrl } = await depositFunds(selectedTrade.id);
            if (authorizationUrl) {
                await Linking.openURL(authorizationUrl);
                Alert.alert(
                    "Complete Payment",
                    "Complete payment in your browser, then return here and tap 'Confirm Payment'."
                );
            } else {
                Alert.alert("Deposit Failed", "No payment link was returned. Please try again.");
            }
        } catch (err: any) {
            Alert.alert("Deposit Failed", getErrorMessage(err));
        } finally {
            setIsActing(false);
        }
    };

    const handleVerifyPayment = async () => {
        if (!selectedTrade) return;
        try {
            setIsActing(true);
            await verifyPayment(selectedTrade.id);
            Alert.alert("Escrow Funded", "Payment verified. The seller has been notified.");
            await fetchTradeById(selectedTrade.id);
        } catch (err: any) {
            Alert.alert("Verification Failed", getErrorMessage(err));
        } finally {
            setIsActing(false);
        }
    };

    const handleSellerUpload = async () => {
        if (!selectedTrade) return;
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        const result = permission.granted
            ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.3 })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                base64: true,
                quality: 0.3,
            });
        const photo = result.canceled ? null : result.assets[0]?.base64;
        if (!photo) return;

        try {
            setIsActing(true);
            const updated = await sellerUpload(selectedTrade.id, photo);
            Alert.alert(
                "Item Verified",
                `Your dispatch code is ${updated.dispatchCode}. Share it with the rider at pickup.`
            );
            await fetchTradeById(selectedTrade.id);
        } catch (err: any) {
            Alert.alert("Upload Failed", getErrorMessage(err));
        } finally {
            setIsActing(false);
        }
    };

    if (isLoading) return <LoadingSpinner message="Loading trade..." />;

    if (!selectedTrade) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text style={{ color: colors.muted }}>Trade not found</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title="Trade Details" />

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: spacing[10],
                    gap: spacing[4],
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Status */}
                <Card>
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
                                color: colors.muted,
                                fontSize: 13,
                            }}
                        >
                            Trade Status
                        </Text>
                        <TradeStatusBadge status={selectedTrade.status} />
                    </View>
                    <TradeStatusBar status={selectedTrade.status} />
                </Card>

                {/* Amount */}
                <Card>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                            <Text
                                style={{
                                    color: colors.muted,
                                    fontSize: 13,
                                    marginBottom: spacing[1],
                                }}
                            >
                                Amount
                            </Text>
                            <Text
                                style={{
                                    color: colors.primary,
                                    fontSize: 28,
                                    fontWeight: "700",
                                }}
                            >
                                {formatCurrency(selectedTrade.price)}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => setIsShareModalOpen(true)}
                            activeOpacity={0.8}
                            style={{
                                backgroundColor: `${colors.primary}18`,
                                borderWidth: 1,
                                borderColor: colors.primary,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 12,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <Ionicons name="share-social-outline" size={16} color={colors.primary} />
                            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>
                                Share Deal
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* 100% Escrow Guarantee Badge Card */}
                <View
                    style={{
                        backgroundColor: `${colors.primary}10`,
                        borderWidth: 1,
                        borderColor: `${colors.primary}35`,
                        borderRadius: 16,
                        padding: spacing[3],
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>
                            SafeTrade Escrow Guaranteed
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 1 }}>
                            Funds remain securely locked until physical delivery inspection is approved.
                        </Text>
                    </View>
                </View>

                {/* Details */}
                <Card style={{ gap: spacing[3] }}>
                    {[
                        {
                            label: "Buyer",
                            value: buyerName || "—",
                        },
                        {
                            label: "Seller",
                            value: sellerName || "—",
                        },
                        {
                            label: "Created",
                            value: formatDateTime(selectedTrade.createdAt),
                        },
                        {
                            label: "Pickup Location",
                            value: selectedTrade.pickupLocation || "—",
                        },
                        {
                            label: "Trade Code",
                            value: (selectedTrade as any).tradeCode ?? selectedTrade.id,
                        },
                    ].map((item) => (
                        <View
                            key={item.label}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.muted,
                                    fontSize: 13,
                                }}
                            >
                                {item.label}
                            </Text>
                            <Text
                                style={{
                                    color: colors.foreground,
                                    fontSize: 13,
                                    fontWeight: "500",
                                    maxWidth: "60%",
                                    textAlign: "right",
                                }}
                            >
                                {item.value}
                            </Text>
                        </View>
                    ))}
                </Card>

                {/* Verified Item Photo Card */}
                {selectedTrade.itemPhotoBase64 ? (
                    <Card>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[3] }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>
                                    Verified Item Photo
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsPhotoModalOpen(true)}>
                                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>View Full</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={() => setIsPhotoModalOpen(true)}
                            activeOpacity={0.9}
                            style={{ borderRadius: 12, overflow: "hidden", backgroundColor: colors.background }}
                        >
                            <Image
                                source={{
                                    uri: selectedTrade.itemPhotoBase64.startsWith("data:")
                                        ? selectedTrade.itemPhotoBase64
                                        : `data:image/jpeg;base64,${selectedTrade.itemPhotoBase64}`,
                                }}
                                style={{ width: "100%", height: 180, borderRadius: 12 }}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    </Card>
                ) : null}

                {/* Full Screen Photo Modal */}
                <Modal
                    visible={isPhotoModalOpen}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsPhotoModalOpen(false)}
                >
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center", padding: 20 }}>
                        <TouchableOpacity
                            onPress={() => setIsPhotoModalOpen(false)}
                            style={{ position: "absolute", top: insets.top + 16, right: 20, zIndex: 10, padding: 8 }}
                        >
                            <Ionicons name="close-circle" size={36} color="#ffffff" />
                        </TouchableOpacity>
                        {selectedTrade.itemPhotoBase64 && (
                            <Image
                                source={{
                                    uri: selectedTrade.itemPhotoBase64.startsWith("data:")
                                        ? selectedTrade.itemPhotoBase64
                                        : `data:image/jpeg;base64,${selectedTrade.itemPhotoBase64}`,
                                }}
                                style={{ width: "100%", height: "70%", borderRadius: 16 }}
                                resizeMode="contain"
                            />
                        )}
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 16, textAlign: "center" }}>
                            Condition verified at dispatch
                        </Text>
                    </View>
                </Modal>

                {/* Next action for the current role */}
                {isBuyer &&
                    (selectedTrade.status === "CREATED" ||
                        selectedTrade.status === "PENDING") && (
                        <>
                            <Button
                                label="Deposit Funds into Escrow"
                                onPress={handleDeposit}
                                isLoading={isActing}
                            />
                            <Button
                                label="Confirm Payment"
                                onPress={handleVerifyPayment}
                                isLoading={isActing}
                                variant="outlined"
                            />
                        </>
                    )}
                {isSeller && selectedTrade.status === "FUNDED" && (
                    <Button
                        label="Take Item Photo to Get Dispatch Code"
                        onPress={handleSellerUpload}
                        isLoading={isActing}
                    />
                )}

                {isSeller &&
                    selectedTrade.status === "DISPATCH_PENDING" &&
                    selectedTrade.dispatchCode && (
                        <Card>
                            <TouchableOpacity
                                onPress={async () => {
                                    if (selectedTrade.dispatchCode) {
                                        await Clipboard.setStringAsync(selectedTrade.dispatchCode);
                                        Toast.show({ type: "info", text1: "Copied", text2: `Dispatch Code (${selectedTrade.dispatchCode}) copied!` });
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[1] }}>
                                    <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>
                                        Dispatch Code
                                    </Text>
                                    <Ionicons name="copy-outline" size={16} color={colors.primary} />
                                </View>
                                <Text style={{ color: colors.primary, fontSize: 24, fontWeight: "800", letterSpacing: 2 }}>
                                    {selectedTrade.dispatchCode}
                                </Text>
                                <Text style={{ color: colors.muted, fontSize: 11, marginTop: spacing[1] }}>
                                    Note: Share this 6-digit code with your rider when they pick up the parcel.
                                </Text>
                            </TouchableOpacity>
                        </Card>
                    )}

                {isBuyer &&
                    selectedTrade.status === "IN_TRANSIT" &&
                    (selectedTrade.releaseCode || selectedTrade.directDeliveryCode) && (
                        <Card>
                            <TouchableOpacity
                                onPress={async () => {
                                    const code = selectedTrade.releaseCode || selectedTrade.directDeliveryCode;
                                    if (code) {
                                        await Clipboard.setStringAsync(code);
                                        Toast.show({ type: "info", text1: "Copied", text2: `Delivery Code (${code}) copied!` });
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[1] }}>
                                    <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>
                                        Delivery Code
                                    </Text>
                                    <Ionicons name="copy-outline" size={16} color={colors.primary} />
                                </View>
                                <Text style={{ color: colors.primary, fontSize: 24, fontWeight: "800", letterSpacing: 2 }}>
                                    {selectedTrade.releaseCode || selectedTrade.directDeliveryCode}
                                </Text>
                                <Text style={{ color: colors.muted, fontSize: 11, marginTop: spacing[1] }}>
                                    Note: Give this 6-digit code to the rider upon parcel delivery to complete the trade and release funds.
                                </Text>
                            </TouchableOpacity>
                        </Card>
                    )}

                {/* Description */}
                {selectedTrade.description && (
                    <Card>
                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 13,
                                marginBottom: spacing[2],
                            }}
                        >
                            Description
                        </Text>
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 14,
                                lineHeight: 22,
                            }}
                        >
                            {selectedTrade.description}
                        </Text>
                    </Card>
                )}

                {/* Cancel Trade Button — Visible until IN_TRANSIT stage */}
                {selectedTrade && ["CREATED", "PENDING", "FUNDED", "DISPATCH_PENDING"].includes(selectedTrade.status) && (
                    <TouchableOpacity
                        onPress={handleCancelTrade}
                        disabled={isActing}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: colors.danger,
                            borderRadius: 24,
                            paddingVertical: 16,
                            paddingHorizontal: spacing[5],
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            gap: 10,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.08,
                            shadowRadius: 24,
                            elevation: 8,
                            marginTop: spacing[2],
                        }}
                    >
                        {isActing ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <>
                                <Ionicons name="close-circle-outline" size={20} color="#ffffff" />
                                <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>
                                    Cancel Trade
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>

            <ShareDealModal
                visible={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title={selectedTrade.title}
                price={selectedTrade.price}
                tradeCode={(selectedTrade as any).tradeCode ?? selectedTrade.id}
            />
        </View>
    );
}