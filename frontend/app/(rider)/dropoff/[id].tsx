import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenHeader from "@/components/shared/ScreenHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { Trade } from "@/types/trade";
import { getTradeForDropoff, riderConfirmDropoff } from "@/services/riderService";
import { postDropoff } from "@/services/tradeService";
import { formatCurrency } from "@/utils/formatCurrency";

export default function RiderDropoff() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const [trade, setTrade] = useState<Trade | null>(null);
    const [buyerUsername, setBuyerUsername] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirming, setIsConfirming] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [dropoffType, setDropoffType] = useState<"POST" | "DIRECT">("POST");

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const result = await getTradeForDropoff(id);
                setTrade(result.trade);
                setBuyerUsername(result.buyerUsername);
            } catch (err: any) {
                Alert.alert("Error", "Could not load trade details.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [id]);

    const handleConfirmDropoff = async () => {
        if (!id) return;
        if (!verificationCode || verificationCode.trim().length < 4) {
            Alert.alert("Invalid Code", "Please enter the verification code.");
            return;
        }
        try {
            setIsConfirming(true);
            if (dropoffType === "DIRECT") {
                await riderConfirmDropoff(id, verificationCode);
                Alert.alert(
                    "Delivery Confirmed",
                    "The trade ID has been verified. Funds have been released to the seller.",
                    [{ text: "Done", onPress: () => router.replace("/(rider)/home") }]
                );
            } else {
                await postDropoff(id, verificationCode);
                Alert.alert(
                    "Post Drop-off Confirmed",
                    "The package has been verified by the post agent. The buyer will be notified.",
                    [{ text: "Done", onPress: () => router.replace("/(rider)/home") }]
                );
            }
        } catch (err: any) {
            Alert.alert("Error", err?.response?.data ?? err?.message ?? "Could not confirm drop-off.");
        } finally {
            setIsConfirming(false);
        }
    };

    if (isLoading) return <LoadingSpinner message="Loading trade..." />;

    if (!trade) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.muted }}>Trade not found</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title="Confirm Drop-Off" />
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: spacing[10],
                    gap: spacing[4],
                }}
            >
                <Card style={{ gap: spacing[3] }}>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>Item</Text>
                    <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700" }}>
                        {trade.title}
                    </Text>
                    <Text style={{ color: colors.primary, fontSize: 22, fontWeight: "800" }}>
                        {formatCurrency(trade.price)}
                    </Text>
                </Card>

                <Card style={{ gap: spacing[2] }}>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>Buyer</Text>
                    <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "600" }}>
                        {buyerUsername}
                    </Text>
                </Card>

                {/* Drop-off Type Selector */}
                <View style={{ flexDirection: "row", gap: spacing[2], marginTop: spacing[2] }}>
                    <TouchableOpacity
                        onPress={() => { setDropoffType("POST"); setVerificationCode(""); }}
                        style={{
                            flex: 1,
                            backgroundColor: dropoffType === "POST" ? colors.primary : colors.card,
                            padding: spacing[3],
                            borderRadius: 8,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: dropoffType === "POST" ? colors.primary : colors.border
                        }}
                    >
                        <Text style={{ color: dropoffType === "POST" ? "white" : colors.foreground, fontWeight: "600" }}>
                            Post Agent
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => { setDropoffType("DIRECT"); setVerificationCode(""); }}
                        style={{
                            flex: 1,
                            backgroundColor: dropoffType === "DIRECT" ? colors.primary : colors.card,
                            padding: spacing[3],
                            borderRadius: 8,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: dropoffType === "DIRECT" ? colors.primary : colors.border
                        }}
                    >
                        <Text style={{ color: dropoffType === "DIRECT" ? "white" : colors.foreground, fontWeight: "600" }}>
                            Direct to Buyer
                        </Text>
                    </TouchableOpacity>
                </View>

                <Card style={{ gap: spacing[3] }}>
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                        {dropoffType === "POST" ? "Drop-Off at Post Agent" : "Direct Delivery to Buyer"}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 13, marginBottom: spacing[1] }}>
                        {dropoffType === "POST" 
                            ? "Ask the Post Agent for their Drop-Off Code to confirm you delivered the package to them."
                            : "Ask the Buyer for their Delivery Verification Code to confirm you delivered the package directly to them."}
                    </Text>
                    <Input
                        placeholder={dropoffType === "POST" ? "Enter Post Agent Code" : "Enter Buyer Code"}
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        autoCapitalize="none"
                    />
                </Card>

                <Button
                    label={dropoffType === "POST" ? "Confirm Drop-Off at Post" : "Confirm Direct Delivery"}
                    onPress={handleConfirmDropoff}
                    isLoading={isConfirming}
                />
            </ScrollView>
        </View>
    );
}