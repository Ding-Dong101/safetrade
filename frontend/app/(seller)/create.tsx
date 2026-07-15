import { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useTrades } from "@/hooks/useTrades";
import { createTrade } from "@/services/tradeService";

export default function CreateTrade() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { refetch } = useTrades();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tradeCode, setTradeCode] = useState<string | null>(null);

    const handleCreate = async () => {
        const nextErrors: Record<string, string> = {};
        const parsedPrice = Number(price);
        if (!title.trim()) nextErrors.title = "Item name is required";
        if (!price.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
            nextErrors.price = "Enter a valid price";
        }
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        try {
            setIsSubmitting(true);
            const result = await createTrade({
                title: title.trim(),
                description: description.trim() || undefined,
                price: parsedPrice,
                sellerId: "seller-001",
            });
            await refetch();
            setTradeCode(result.tradeCode);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setTitle("");
        setDescription("");
        setPrice("");
        setTradeCode(null);
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
                    Create Trade
                </Text>

                {tradeCode ? (
                    <Card
                        style={{
                            padding: spacing[6],
                            borderRadius: 20,
                            alignItems: "center",
                            gap: spacing[3],
                        }}
                    >
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: colors.primary + "20",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons
                                name="checkmark-circle"
                                size={32}
                                color={colors.primary}
                            />
                        </View>
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 17,
                                fontWeight: "700",
                            }}
                        >
                            Trade Created
                        </Text>
                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 13,
                                textAlign: "center",
                                lineHeight: 20,
                            }}
                        >
                            Share this trade code with your buyer. They can enter it
                            in their Accept Trade tab to join the trade.
                        </Text>
                        <View
                            style={{
                                backgroundColor: colors.cardAlt,
                                borderRadius: 12,
                                paddingVertical: spacing[3],
                                paddingHorizontal: spacing[8],
                                borderWidth: 1,
                                borderColor: colors.primary,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.primary,
                                    fontSize: 24,
                                    fontWeight: "800",
                                    letterSpacing: 6,
                                }}
                            >
                                {tradeCode}
                            </Text>
                        </View>
                        <View
                            style={{
                                flexDirection: "row",
                                gap: spacing[3],
                                marginTop: spacing[2],
                            }}
                        >
                            <Button
                                label="New Trade"
                                variant="outlined"
                                onPress={handleReset}
                                style={{ flex: 1 }}
                            />
                            <Button
                                label="View Trades"
                                onPress={() => router.push("/(seller)/home")}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </Card>
                ) : (
                    <Card style={{ padding: spacing[6], borderRadius: 20 }}>
                        <Input
                            label="Item Name"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. HP Envy"
                            error={errors.title}
                        />
                        <Input
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe the item and condition"
                            multiline
                            numberOfLines={3}
                            style={{ minHeight: 80, textAlignVertical: "top" }}
                        />
                        <Input
                            label="Price (GHS)"
                            value={price}
                            onChangeText={setPrice}
                            placeholder="750.00"
                            keyboardType="decimal-pad"
                            error={errors.price}
                        />

                        <Button
                            label="Create Trade"
                            onPress={handleCreate}
                            isLoading={isSubmitting}
                            style={{ marginTop: spacing[2] }}
                        />
                    </Card>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
