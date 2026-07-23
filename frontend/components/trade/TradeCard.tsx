import { View, Text, TouchableOpacity, Alert, Linking } from "react-native";
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

    const showDirectDeliveryCode = role === "buyer" && trade.status === "IN_TRANSIT" && trade.directDeliveryCode;
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

            {showDirectDeliveryCode && (
                <View
                    style={{
                        backgroundColor: colors.primary + "18",
                        borderWidth: 1,
                        borderColor: colors.primary + "55",
                        borderRadius: 8,
                        padding: spacing[3],
                        marginBottom: spacing[2],
                    }}
                >
                    <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", marginBottom: 4 }}>
                        DIRECT DELIVERY CODE — give to rider
                    </Text>
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 18,
                            fontWeight: "800",
                            letterSpacing: 1.5,
                            fontVariant: ["tabular-nums"],
                        }}
                        selectable
                    >
                        {trade.directDeliveryCode}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
                        Or let the rider drop off at the post office station.
                    </Text>
                </View>
            )}

            {showPickupCode && (
                <View
                    style={{
                        backgroundColor: colors.accent + "18",
                        borderWidth: 1,
                        borderColor: colors.accent + "55",
                        borderRadius: 8,
                        padding: spacing[3],
                        marginBottom: spacing[2],
                    }}
                >
                    <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", marginBottom: 4 }}>
                        PICK-UP CODE — show at post office
                    </Text>
                    <Text
                        style={{
                            color: colors.accent,
                            fontSize: 18,
                            fontWeight: "800",
                            letterSpacing: 1.5,
                            fontVariant: ["tabular-nums"],
                        }}
                        selectable
                    >
                        {trade.releaseCode}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
                        Your item is at the post office. Show this code to collect it.
                    </Text>
                </View>
            )}

            {/* Secondary Codes List — Clean Grey Subsection Styling with Copy Symbol */}
            {role === "seller" && trade.riderCode && (
                <TouchableOpacity
                    onPress={async () => {
                        await Clipboard.setStringAsync(trade.riderCode!);
                        Toast.show({ type: "info", text1: "Copied", text2: `Rider Code (${trade.riderCode}) copied!` });
                    }}
                    activeOpacity={0.7}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: spacing[1] }}
                >
                    <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "400" }}>
                        Rider Code: {trade.riderCode}
                    </Text>
                    <Ionicons name="copy-outline" size={13} color={colors.muted} />
                </TouchableOpacity>
            )}

            {showDispatchCode && (
                <TouchableOpacity
                    onPress={async () => {
                        if (trade.dispatchCode) {
                            await Clipboard.setStringAsync(trade.dispatchCode);
                            Toast.show({ type: "info", text1: "Copied", text2: `Dispatch Code (${trade.dispatchCode}) copied!` });
                        }
                    }}
                    activeOpacity={0.7}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: spacing[1] }}
                >
                    <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "400" }}>
                        Dispatch Code: {trade.dispatchCode}
                    </Text>
                    <Ionicons name="copy-outline" size={13} color={colors.muted} />
                </TouchableOpacity>
            )}

            {role === "seller" && trade.releaseCode && (
                <TouchableOpacity
                    onPress={async () => {
                        await Clipboard.setStringAsync(trade.releaseCode!);
                        Toast.show({ type: "info", text1: "Copied", text2: `Delivery Code (${trade.releaseCode}) copied!` });
                    }}
                    activeOpacity={0.7}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: spacing[1] }}
                >
                    <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "400" }}>
                        Delivery Code: {trade.releaseCode}
                    </Text>
                    <Ionicons name="copy-outline" size={13} color={colors.muted} />
                </TouchableOpacity>
            )}

            {role === "seller" && trade.dropOffCode && (
                <TouchableOpacity
                    onPress={async () => {
                        await Clipboard.setStringAsync(trade.dropOffCode!);
                        Toast.show({ type: "info", text1: "Copied", text2: `Post Drop-Off Code (${trade.dropOffCode}) copied!` });
                    }}
                    activeOpacity={0.7}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: spacing[1] }}
                >
                    <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "400" }}>
                        Post Drop-Off Code: {trade.dropOffCode}
                    </Text>
                    <Ionicons name="copy-outline" size={13} color={colors.muted} />
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
