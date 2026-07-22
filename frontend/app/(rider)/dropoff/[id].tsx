import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenHeader from "@/components/shared/ScreenHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { Trade } from "@/types/trade";
import { getTradeForDropoff, riderConfirmDropoff } from "@/services/riderService";
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
        if (!verificationCode || verificationCode.trim().length < 5) {
            Alert.alert("Invalid Code", "Please enter the verification code provided by the buyer.");
            return;
        }
        try {
            setIsConfirming(true);
            await riderConfirmDropoff(id, verificationCode);
            Alert.alert(
                "Delivery Confirmed",
                "The trade ID has been verified. Funds have been released to the seller.",
                [{ text: "Done", onPress: () => router.replace("/(rider)/home") }]
            );
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

                <Card style={{ gap: spacing[2] }}>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>Trade ID (for your records)</Text>
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "500" }}>
                        {(trade.title ?? "TRD").substring(0, 3).toUpperCase()}-{trade.id.substring(0, 8).toUpperCase()}
                    </Text>
                </Card>

                <Card style={{ gap: spacing[3] }}>
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                        Direct Delivery
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 13, marginBottom: spacing[1] }}>
                        Ask the buyer for their verification code to confirm drop-off and release funds.
                    </Text>
                    <Input
                        placeholder="Enter Buyer Verification Code"
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        autoCapitalize="none"
                    />
                </Card>

                <Button
                    label="Confirm Drop-Off & Release Funds"
                    onPress={handleConfirmDropoff}
                    isLoading={isConfirming}
                />
            </ScrollView>
        </View>
    );
}