import { View, Text, ScrollView } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useRouter } from "expo-router";

export default function New() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const [sellerUsername, setSellerUsername] = useState("");
    const [amount, setAmount] = useState("");
    const [comments, setComments] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!sellerUsername || !amount) return;
        setIsLoading(true);
        // Will connect to backend later
        setTimeout(() => {
            setIsLoading(false);
            router.push("/(tabs)/home" as any);
        }, 1000);
    };

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{
                paddingHorizontal: spacing[4],
                paddingTop: insets.top + spacing[4],
                paddingBottom: spacing[20],
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 22,
                    fontWeight: "700",
                    marginBottom: spacing[2],
                }}
            >
                Create New Trade
            </Text>
            <Text
                style={{
                    color: colors.muted,
                    fontSize: 14,
                    marginBottom: spacing[6],
                }}
            >
                Fill in the details to start a new escrow trade.
            </Text>

            {/* Form */}
            <View
                style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: spacing[5],
                    borderWidth: 1,
                    borderColor: colors.border,
                    gap: spacing[2],
                }}
            >
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 13,
                        marginBottom: spacing[2],
                    }}
                >
                    Your funds are protected until delivery is confirmed
                </Text>

                <Input
                    label="Seller's Username"
                    placeholder="Enter seller's username"
                    value={sellerUsername}
                    onChangeText={setSellerUsername}
                    autoCapitalize="none"
                />

                <Input
                    label="Deposit Amount (GHS)"
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />

                <Input
                    label="Comments (optional)"
                    placeholder="Add any notes about the trade"
                    value={comments}
                    onChangeText={setComments}
                    multiline
                    numberOfLines={4}
                />

                <Button
                    label="Create & Deposit Funds"
                    onPress={handleCreate}
                    isLoading={isLoading}
                    style={{ marginTop: spacing[2] }}
                />
            </View>
        </ScrollView>
    );
}