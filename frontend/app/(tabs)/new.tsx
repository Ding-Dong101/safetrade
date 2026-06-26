import { View, Text, ScrollView, Alert } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { createTrade } from "@/services/tradeService";
import { getUserByUsername } from "@/services/authService";

export default function New() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [sellerUsername, setSellerUsername] = useState("");
    const [amount, setAmount] = useState("");
    const [comments, setComments] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!sellerUsername.trim() || !amount.trim()) {
            Alert.alert("Error", "Please fill in seller's username and deposit amount");
            return;
        }

        const priceNum = parseFloat(amount);
        if (isNaN(priceNum) || priceNum <= 0) {
            Alert.alert("Error", "Please enter a valid deposit amount");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Resolve seller's username to UUID
            const seller = await getUserByUsername(sellerUsername.trim());
            if (!seller || !seller.id) {
                Alert.alert("Error", "Seller username not found in SafeTrade system");
                setIsLoading(false);
                return;
            }

            // 2. Call backend to create trade
            await createTrade({
                title: `Trade for ${comments.slice(0, 30) || 'Escrow Transaction'}`,
                description: comments.trim() || "SafeTrade escrow deposit",
                price: priceNum,
                sellerId: seller.id,
            });

            Alert.alert("Success", "Trade created successfully!");
            setSellerUsername("");
            setAmount("");
            setComments("");
            router.push("/(tabs)/home" as any);
        } catch (err: any) {
            Alert.alert("Error", err?.response?.data?.message ?? "Failed to create trade");
        } finally {
            setIsLoading(false);
        }
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
                        color: colors.primary,
                        fontSize: 13,
                        fontWeight: "600",
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
                    label="Comments / Description"
                    placeholder="Add notes about item description and terms"
                    value={comments}
                    onChangeText={setComments}
                    multiline
                    numberOfLines={4}
                    style={{
                        height: 80,
                    }}
                />

                <Button
                    label="Create & Init Escrow"
                    onPress={handleCreate}
                    isLoading={isLoading}
                    style={{
                        backgroundColor: colors.primary,
                        marginTop: spacing[4],
                        borderRadius: 12,
                    }}
                    textStyle={{
                        color: "#000",
                        fontWeight: "700",
                    }}
                />
            </View>
        </ScrollView>
    );
}