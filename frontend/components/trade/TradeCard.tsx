import { View, Text, TouchableOpacity } from "react-native";
import * as Clipboard from 'expo-clipboard';
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
import { Alert, Linking } from "react-native";
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
            Alert.alert("Deposit Failed", err?.response?.data ?? err?.message ?? "Please try again.");
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
            Alert.alert("Verification Failed", err?.response?.data ?? err?.message ?? "Please try again.");
        } finally {
            setIsActing(false);
        }
    };

    const showPickupCode = role === "buyer" && trade.status === "AT_POST" && trade.releaseCode;
    const showDispatchCode = role === "seller" && trade.status === "DISPATCH_PENDING" && trade.dispatchCode;
    const pendingVerification = trade.status === "FUNDED";

    return (
        <Card onPress={onPress} style={{ marginBottom: spacing[3] }}>
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
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 12,
                        flex: 1,
                        marginRight: spacing[2],
                    }}
                    numberOfLines={1}
                >
                    ID: {(trade.title ?? "TRD").substring(0, 3).toUpperCase()}-{trade.id.substring(0, 8).toUpperCase()}
                </Text>
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

            {showPickupCode && (
                <TouchableOpacity
                    onPress={async () => {
                        if (trade.releaseCode) {
                            await Clipboard.setStringAsync(trade.releaseCode);
                            Alert.alert("Copied", "Pick-Up Code copied to clipboard!");
                        }
                    }}
                >
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 13,
                            fontWeight: "600",
                            marginBottom: spacing[1],
                        }}
                    >
                        Pick-Up Code: {trade.releaseCode} (Tap to copy)
                    </Text>
                </TouchableOpacity>
            )}

            {showDispatchCode && (
                <TouchableOpacity
                    onPress={async () => {
                        if (trade.dispatchCode) {
                            await Clipboard.setStringAsync(trade.dispatchCode);
                            Alert.alert("Copied", "Dispatch Code copied to clipboard!");
                        }
                    }}
                >
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 13,
                            fontWeight: "600",
                            marginBottom: spacing[1],
                        }}
                    >
                        Dispatch Code: {trade.dispatchCode} (Tap to copy)
                    </Text>
                </TouchableOpacity>
            )}

            {role === "seller" && trade.tradeCode && (
                <TouchableOpacity
                    onPress={async () => {
                        await Clipboard.setStringAsync(trade.tradeCode!);
                        Alert.alert("Copied", "Trade Code copied to clipboard!");
                    }}
                >
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600", marginBottom: spacing[1] }}>
                        Trade Code: {trade.tradeCode} (Tap to copy)
                    </Text>
                </TouchableOpacity>
            )}

            {role === "seller" && trade.releaseCode && (
                <TouchableOpacity
                    onPress={async () => {
                        await Clipboard.setStringAsync(trade.releaseCode!);
                        Alert.alert("Copied", "Delivery Code copied to clipboard!");
                    }}
                >
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600", marginBottom: spacing[1] }}>
                        Delivery Code: {trade.releaseCode} (Tap to copy)
                    </Text>
                </TouchableOpacity>
            )}

            {role === "seller" && trade.dropOffCode && (
                <TouchableOpacity
                    onPress={async () => {
                        await Clipboard.setStringAsync(trade.dropOffCode!);
                        Alert.alert("Copied", "Post Drop-Off Code copied to clipboard!");
                    }}
                >
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600", marginBottom: spacing[1] }}>
                        Post Drop-Off Code: {trade.dropOffCode} (Tap to copy)
                    </Text>
                </TouchableOpacity>
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
