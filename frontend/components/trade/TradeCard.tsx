import { View, Text, TouchableOpacity, Alert, Linking, Modal, Image, Pressable } from "react-native";
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import Card from "@/components/ui/Card";
import TradeStatusBadge from "./TradeStatusBadge";
import TradeStatusBar from "./TradeStatusBar";
import { useTheme } from "@/hooks/useTheme";
import { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/formatCurrency";
import { Role } from "@/types/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useState } from "react";
import { depositFunds, buyerConfirmRiderDelivery } from "@/services/tradeService";

interface TradeCardProps {
    trade: Trade;
    role?: Role;
    onPress?: () => void;
}

const TradeCard = ({ trade, role = "buyer", onPress }: TradeCardProps) => {
    const { colors, spacing } = useTheme();
    const [isActing, setIsActing] = useState(false);
    const [riderCodeInput, setRiderCodeInput] = useState("");
    const [showPhotoPreview, setShowPhotoPreview] = useState(false);


    const handleDeposit = async () => {
        try {
            setIsActing(true);
            const { authorizationUrl } = await depositFunds(trade.id);
            if (authorizationUrl) {
                await Linking.openURL(authorizationUrl);
                Alert.alert("Complete Payment", "Complete payment in your browser, then open trade details to confirm.");
            } else {
                Alert.alert("Deposit Failed", "No payment link returned.");
            }
        } catch (err: any) {
            const msg = typeof err?.response?.data === "string" ? err.response.data : (err?.message ?? "Please try again.");
            Alert.alert("Deposit Failed", msg);
        } finally {
            setIsActing(false);
        }
    };

    const handleConfirmRiderDelivery = async () => {
        if (!riderCodeInput || riderCodeInput.length < 5) {
            Alert.alert("Invalid Code", "Please enter the valid delivery code provided by the rider.");
            return;
        }
        try {
            setIsActing(true);
            await buyerConfirmRiderDelivery(trade.id, riderCodeInput);
            Alert.alert("Receipt Confirmed", "You have successfully received the item. Funds are now released to the seller.");
            if (onPress) onPress(); // trigger a refresh or navigation
        } catch (err: any) {
            const msg = typeof err?.response?.data === "string" ? err.response.data : (err?.message ?? "Please try again.");
            Alert.alert("Verification Failed", msg);
        } finally {
            setIsActing(false);
        }
    };

    const showDirectDeliveryCode = role === "buyer" && trade.status === "IN_TRANSIT" && trade.directDeliveryCode;
    const showPickupCode = role === "buyer" && trade.status === "AT_POST" && trade.releaseCode;
    const showDispatchCode = role === "seller" && trade.status === "DISPATCH_PENDING" && trade.dispatchCode;
    const pendingVerification = trade.status === "FUNDED";

    return (

              <Card onPress={onPress} style={{ marginBottom: spacing[3] }}>
                  {trade.itemPhotoBase64 && (
                      <>
                          <TouchableOpacity
                              onPress={() => setShowPhotoPreview(true)}
                              activeOpacity={0.8}
                              style={{
                                  position: "absolute",
                                  top: spacing[2],
                                  right: spacing[2],
                                  zIndex: 10,
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  overflow: "hidden",
                                  borderWidth: 2,
                                  borderColor: colors.background,
                              }}
                          >
                              <Image
                                  source={{ uri: `data:image/jpeg;base64,${trade.itemPhotoBase64}` }}
                                  style={{ width: "100%", height: "100%" }}
                                  resizeMode="cover"
                              />
                          </TouchableOpacity>

                          <Modal
                              visible={showPhotoPreview}
                              transparent
                              animationType="fade"
                              onRequestClose={() => setShowPhotoPreview(false)}
                          >
                              <Pressable
                                  onPress={() => setShowPhotoPreview(false)}
                                  style={{
                                      flex: 1,
                                      backgroundColor: "rgba(0,0,0,0.85)",
                                      justifyContent: "center",
                                      alignItems: "center",
                                  }}
                              >
                                  <Image
                                      source={{ uri: `data:image/jpeg;base64,${trade.itemPhotoBase64}` }}
                                      style={{ width: "85%", height: "60%" }}
                                      resizeMode="contain"
                                  />
                              </Pressable>
                          </Modal>
                      </>
                  )}

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
                        flex: 1,
                        marginRight: spacing[2],
                    }}
                    numberOfLines={1}
                >
                    {trade.title ?? "Trade"}
                </Text>
                <TradeStatusBadge status={trade.status} />
            </View>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing[2],
                }}
            >
                <TouchableOpacity
                    onPress={async () => {
                        const codeToCopy = trade.tradeCode ?? trade.id;
                        await Clipboard.setStringAsync(codeToCopy);
                        Toast.show({ type: "info", text1: "Copied", text2: `Trade Code (${codeToCopy}) copied!` });
                    }}
                    activeOpacity={0.7}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1, marginRight: spacing[2] }}
                >
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 12,
                            fontWeight: "400",
                        }}
                        numberOfLines={1}
                    >
                        Trade Code: {trade.tradeCode ?? trade.id}
                    </Text>
                    <Ionicons name="copy-outline" size={13} color={colors.muted} />
                </TouchableOpacity>

                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 18,
                        fontWeight: "700",
                        fontVariant: ["tabular-nums"],
                    }}
                >
                    {formatCurrency(trade.price)}
                </Text>
            </View>

            {trade.pickupLocation && (
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 12,
                        fontWeight: "400",
                        marginBottom: spacing[1],
                    }}
                    numberOfLines={1}
                >
                    Pickup Location: {trade.pickupLocation}
                </Text>
            )}

            {/* Active Step Code Only on Mini Card */}
            {role === "buyer" && trade.status === "IN_TRANSIT" && (trade.releaseCode || trade.directDeliveryCode) && (
                <View style={{ marginBottom: spacing[2] }}>
                    <TouchableOpacity
                        onPress={async () => {
                            const code = trade.releaseCode || trade.directDeliveryCode;
                            if (code) {
                                await Clipboard.setStringAsync(code);
                                Toast.show({ type: "info", text1: "Copied", text2: `Delivery Code (${code}) copied!` });
                            }
                        }}
                        activeOpacity={0.7}
                        style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}
                    >
                        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>
                            Delivery Code: {trade.releaseCode || trade.directDeliveryCode}
                        </Text>
                        <Ionicons name="copy-outline" size={14} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "400" }}>
                        Give this 6-digit code to your rider upon parcel delivery.
                    </Text>
                </View>
            )}

            {role === "seller" && trade.status === "DISPATCH_PENDING" && trade.dispatchCode && (
                <View style={{ marginBottom: spacing[2] }}>
                    <TouchableOpacity
                        onPress={async () => {
                            if (trade.dispatchCode) {
                                await Clipboard.setStringAsync(trade.dispatchCode);
                                Toast.show({ type: "info", text1: "Copied", text2: `Dispatch Code (${trade.dispatchCode}) copied!` });
                            }
                        }}
                        activeOpacity={0.7}
                        style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}
                    >
                        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>
                            Dispatch Code: {trade.dispatchCode}
                        </Text>
                        <Ionicons name="copy-outline" size={14} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "400" }}>
                        Give this 6-digit code to the rider when handing over the item.
                    </Text>
                </View>
            )}

            {pendingVerification && (
                <Text
                    style={{
                        color: colors.accent,
                        fontSize: 12,
                        fontWeight: "600",
                        marginBottom: spacing[1],
                    }}
                >
                    Pending Photo Verification.
                </Text>
            )}

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

            {role === "buyer" && (trade.status === "CREATED" || trade.status === "PENDING") && (
                <View style={{ marginBottom: spacing[2] }}>
                    <Button 
                        label="Deposit Funds" 
                        onPress={handleDeposit} 
                        isLoading={isActing} 
                    />
                </View>
            )}

            {role === "buyer" && trade.status === "IN_TRANSIT" && (
                <View style={{ marginBottom: spacing[2], marginTop: spacing[2] }}>
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600", marginBottom: spacing[1] }}>
                        Direct Delivery Confirmation
                    </Text>
                    <Input
                        placeholder="Enter rider's delivery code"
                        value={riderCodeInput}
                        onChangeText={setRiderCodeInput}
                        autoCapitalize="none"
                    />
                    <View style={{ marginTop: spacing[1] }}>
                        <Button 
                            label="Confirm Receipt" 
                            onPress={handleConfirmRiderDelivery} 
                            isLoading={isActing} 
                        />
                    </View>
                </View>
            )}

            <TradeStatusBar status={trade.status} />
        </Card>
    );
};

export default TradeCard;
