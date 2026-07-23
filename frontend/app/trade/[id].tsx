import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/useTheme";
import { useTrades } from "@/hooks/useTrades";
import { useAuth } from "@/hooks/useAuth";
import { depositFunds, verifyPayment, sellerUpload, buyerConfirmRiderDelivery } from "@/services/tradeService";
import * as Linking from "expo-linking";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import ScreenHeader from "@/components/shared/ScreenHeader";
import TradeStatusBadge from "@/components/trade/TradeStatusBadge";
import TradeStatusBar from "@/components/trade/TradeStatusBar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDate";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { getUserById } from "@/services/userService";

export default function TradeDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { selectedTrade, isLoading, fetchTradeById } = useTrades();
    const { user } = useAuth();
    const [isActing, setIsActing] = useState(false);
    const [riderCodeInput, setRiderCodeInput] = useState("");
    const [buyerName, setBuyerName] = useState<string>("");
    const [sellerName, setSellerName] = useState<string>("");

    useEffect(() => {
        if (id) fetchTradeById(id);
    }, [id]);



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
            Alert.alert("Deposit Failed", err?.response?.data ?? err?.message ?? "Please try again.");
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
            Alert.alert("Verification Failed", err?.response?.data ?? err?.message ?? "Please try again.");
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
            Alert.alert("Upload Failed", err?.response?.data ?? err?.message ?? "Please try again.");
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
                </Card>

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
                                        Alert.alert("Copied", "Dispatch Code copied to clipboard!");
                                    }
                                }}
                            >
                                <Text style={{ color: colors.muted, fontSize: 13, marginBottom: spacing[1] }}>
                                    Dispatch Code (share with the rider - tap to copy)
                                </Text>
                                <Text style={{ color: colors.primary, fontSize: 24, fontWeight: "800" }}>
                                    {selectedTrade.dispatchCode}
                                </Text>
                            </TouchableOpacity>
                        </Card>
                    )}

                {isBuyer &&
                    selectedTrade.status === "IN_TRANSIT" &&
                    selectedTrade.directDeliveryCode && (
                        <Card>
                            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: spacing[1] }}>
                                Direct Delivery Code — give to rider to complete trade immediately
                            </Text>
                            <Text style={{ color: colors.primary, fontSize: 24, fontWeight: "800", letterSpacing: 2 }}>
                                {selectedTrade.directDeliveryCode}
                            </Text>
                            <Text style={{ color: colors.muted, fontSize: 12, marginTop: spacing[1] }}>
                                Alternatively, the rider can drop off at the post office using the post drop-off code.
                            </Text>
                        </Card>
                    )}

                {isBuyer &&
                    selectedTrade.status === "AT_POST" &&
                    selectedTrade.releaseCode && (
                        <Card>
                            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: spacing[1] }}>
                                Pick-Up Code — show at the SafeTrade post office to collect
                            </Text>
                            <Text style={{ color: colors.accent, fontSize: 24, fontWeight: "800", letterSpacing: 2 }}>
                                {selectedTrade.releaseCode}
                            </Text>
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
            </ScrollView>
        </View>
    );
}