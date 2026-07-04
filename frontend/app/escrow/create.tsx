import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import ScreenHeader from "@/components/shared/ScreenHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CreateEscrow() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const [itemName, setItemName] = useState("");
    const [amount, setAmount] = useState("");
    const [sellerUsername, setSellerUsername] = useState("");
    const [sellerEmail, setSellerEmail] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!itemName || !amount || !sellerUsername) return;
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.back();
        }, 1000);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title="New Escrow" />

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: spacing[10],
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Info Banner */}
                <View
                    style={{
                        backgroundColor: colors.primary + "15",
                        borderRadius: 12,
                        padding: spacing[4],
                        marginBottom: spacing[5],
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing[3],
                        borderWidth: 1,
                        borderColor: colors.primary + "30",
                    }}
                >
                    <Text style={{ fontSize: 20 }}>🔒</Text>
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 13,
                            flex: 1,
                            lineHeight: 20,
                        }}
                    >
                        Your funds are protected until delivery is confirmed
                    </Text>
                </View>

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
                    <Input
                        label="Item / Service Name"
                        placeholder="e.g. MacBook Pro M4"
                        value={itemName}
                        onChangeText={setItemName}
                    />

                    <Input
                        label="Amount (GHS)"
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                    />

                    <Input
                        label="Enter Username / Email"
                        placeholder="seller@example.com"
                        value={sellerUsername}
                        onChangeText={setSellerUsername}
                        autoCapitalize="none"
                    />

                    <Input
                        label="Description"
                        placeholder="Type some details..."
                        value={description}
                        onChangeText={setDescription}
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
        </View>
    );
}