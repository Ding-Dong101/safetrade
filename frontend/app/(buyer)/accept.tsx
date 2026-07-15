import { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useTrades } from "@/hooks/useTrades";
import { acceptTradeByCode } from "@/services/tradeService";

export default function AcceptTrade() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { refetch } = useTrades();

    const [code, setCode] = useState("");
    const [error, setError] = useState<string | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAccept = async () => {
        if (code.trim().length < 4) {
            setError("Enter the trade code sent by the seller");
            return;
        }
        setError(undefined);

        try {
            setIsSubmitting(true);
            const trade = await acceptTradeByCode(code);
            await refetch();
            setCode("");
            Alert.alert(
                "Trade Accepted",
                `"${trade.title}" has been added to your active trades. Fund the escrow to continue.`,
                [{ text: "View Trades", onPress: () => router.push("/(buyer)/home") }]
            );
        } catch (err: any) {
            setError(err?.message ?? "Failed to accept trade");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: insets.top + spacing[4],
                    paddingBottom: spacing[24],
                    gap: spacing[5],
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 22,
                        fontWeight: "700",
                    }}
                >
                    Accept Trade
                </Text>

                <Card style={{ padding: spacing[6], borderRadius: 20, gap: spacing[2] }}>
                    <View style={{ alignItems: "center", marginBottom: spacing[3] }}>
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: colors.primary + "20",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: spacing[3],
                            }}
                        >
                            <Ionicons name="key" size={28} color={colors.primary} />
                        </View>
                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 13,
                                textAlign: "center",
                                lineHeight: 20,
                            }}
                        >
                            Enter the trade code the seller sent you to add the trade
                            to your portal. Your money stays in escrow until you
                            receive the item.
                        </Text>
                    </View>

                    <Input
                        label="Trade Code"
                        value={code}
                        onChangeText={(value) => setCode(value.toUpperCase())}
                        placeholder="e.g. 13B6AC"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        error={error}
                        style={{
                            textAlign: "center",
                            fontSize: 18,
                            fontWeight: "700",
                            letterSpacing: 4,
                        }}
                    />

                    <Button
                        label="Accept Trade"
                        onPress={handleAccept}
                        isLoading={isSubmitting}
                    />
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
