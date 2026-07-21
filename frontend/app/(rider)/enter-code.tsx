import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenHeader from "@/components/shared/ScreenHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { Trade } from "@/types/trade";
import { previewTradeByRiderCode, riderAcceptDelivery } from "@/services/riderService";
import { formatCurrency } from "@/utils/formatCurrency";

export default function EnterRiderCode() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();

    const [code, setCode] = useState("");
    const [trade, setTrade] = useState<Trade | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);

    const handleLookup = async () => {
        if (code.trim().length < 4) {
            Alert.alert("Invalid Code", "Enter the delivery code the seller gave you.");
            return;
        }
        try {
            setIsLoading(true);
            const result = await previewTradeByRiderCode(code);
            setTrade(result);
        } catch (err: any) {
            Alert.alert("Not Found", err?.response?.data ?? "No delivery found for that code.");
            setTrade(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!trade) return;
        try {
            setIsAccepting(true);
            await riderAcceptDelivery(trade.id);
            Alert.alert("Delivery Accepted", "You've accepted this delivery.");
            router.replace(`/(rider)/dropoff/${trade.id}` as any);
        } catch (err: any) {
            Alert.alert("Error", err?.response?.data ?? err?.message ?? "Could not accept delivery.");
        } finally {
            setIsAccepting(false);
        }
    };

    const handleIgnore = () => {
        setTrade(null);
        setCode("");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScreenHeader title="Enter Delivery Code" />
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: spacing[24],
                    gap: spacing[4],
                }}
                keyboardShouldPersistTaps="handled"
            >
                <Card style={{ padding: spacing[6], borderRadius: 20 }}>
                    <Input
                        label="Delivery Code"
                        value={code}
                        onChangeText={(v) => setCode(v.toUpperCase())}
                        placeholder="e.g. 13B6AC"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        style={{ textAlign: "center", fontSize: 18, fontWeight: "700", letterSpacing: 4 }}
                    />
                    <Button label="Look Up" onPress={handleLookup} isLoading={isLoading} style={{ marginTop: spacing[3] }} />
                </Card>

                {trade && (
                    <Card style={{ padding: spacing[6], borderRadius: 20, gap: spacing[3] }}>
                        <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700" }}>
                            {trade.title}
                        </Text>
                        <Text style={{ color: colors.primary, fontSize: 22, fontWeight: "800" }}>
                            {formatCurrency(trade.price)}
                        </Text>
                        {trade.description && (
                            <Text style={{ color: colors.muted, fontSize: 13 }}>{trade.description}</Text>
                        )}

                        <View style={{ flexDirection: "row", gap: spacing[3], marginTop: spacing[2] }}>
                            <Button
                                label="Ignore"
                                variant="outlined"
                                onPress={handleIgnore}
                                style={{ flex: 1 }}
                            />
                            <Button
                                label="Accept"
                                onPress={handleAccept}
                                isLoading={isAccepting}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </Card>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}