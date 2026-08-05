import { useRef, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    Animated,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useTrades } from "@/hooks/useTrades";
import { acceptTradeByCode, previewTradeByCode, TradePreview } from "@/services/tradeService";
import { formatCurrency } from "@/utils/formatCurrency";

export default function AcceptTrade() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { refetch } = useTrades();

    const [code, setCode] = useState("");
    const [error, setError] = useState<string | undefined>();
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [preview, setPreview] = useState<TradePreview | null>(null);

    // Fade-in animation for the modal content
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const showPreviewModal = (data: TradePreview) => {
        setPreview(data);
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
        }).start();
    };

    const closePreviewModal = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
        }).start(() => setPreview(null));
    };

    // Step 1: Fetch preview — just reads trade info, doesn't join
    const handlePreview = async () => {
        if (code.trim().length < 4) {
            setError("Enter the trade code sent by the seller");
            return;
        }
        setError(undefined);
        try {
            setIsPreviewing(true);
            const data = await previewTradeByCode(code);
            showPreviewModal(data);
        } catch (err: any) {
            const msg = err?.response?.status === 404
                ? "No trade found with that code. Please check and try again."
                : (err?.message ?? "Failed to fetch trade details");
            setError(msg);
        } finally {
            setIsPreviewing(false);
        }
    };

    // Step 2: Actually join the trade after buyer confirms
    const handleAcceptConfirmed = async () => {
        if (!preview) return;
        try {
            setIsAccepting(true);
            const trade = await acceptTradeByCode(code);
            await refetch();
            closePreviewModal();
            setCode("");
            Alert.alert(
                "Trade Accepted! 🎉",
                `"${trade.title}" has been added to your active trades. Fund the escrow to continue.`,
                [{ text: "View Trades", onPress: () => router.push("/(buyer)/home") }]
            );
        } catch (err: any) {
            closePreviewModal();
            setError(err?.message ?? "Failed to accept trade");
        } finally {
            setIsAccepting(false);
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
                <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "700" }}>
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
                        placeholder="e.g. 13B6A"
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
                        onPress={handlePreview}
                        isLoading={isPreviewing}
                    />
                </Card>

                {/* Marketplace Discovery Banner */}
                <TouchableOpacity
                    onPress={() => router.push("/(buyer)/marketplace" as any)}
                    activeOpacity={0.8}
                >
                    <Card
                        style={{
                            padding: spacing[4],
                            borderRadius: 20,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            backgroundColor: colors.card,
                            borderWidth: 1.5,
                            borderColor: `${colors.primary}35`,
                        }}
                    >
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                backgroundColor: `${colors.primary}18`,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons name="storefront" size={22} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>
                                Browse SafeTrade Marketplace
                            </Text>
                            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                                Don't have a code? Discover verified listings and buy with 1-tap escrow.
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                    </Card>
                </TouchableOpacity>
            </ScrollView>

            {/* ── Trade Preview Modal (fade-in) ── */}
            <Modal visible={!!preview} transparent animationType="none" onRequestClose={closePreviewModal}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.55)",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: spacing[5],
                    }}
                >
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [
                                {
                                    scale: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.94, 1],
                                    }),
                                },
                            ],
                            width: "100%",
                            backgroundColor: colors.background,
                            borderRadius: 28,
                            overflow: "hidden",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 16 },
                            shadowOpacity: 0.2,
                            shadowRadius: 32,
                            elevation: 20,
                        }}
                    >
                        {/* Header */}
                        <View
                            style={{
                                backgroundColor: colors.primary,
                                paddingVertical: spacing[5],
                                paddingHorizontal: spacing[6],
                                flexDirection: "row",
                                alignItems: "center",
                                gap: spacing[3],
                            }}
                        >
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Ionicons name="receipt-outline" size={20} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
                                    Trade Preview
                                </Text>
                                <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
                                    Review before you commit
                                </Text>
                            </View>
                        </View>

                        {/* Details */}
                        <View style={{ padding: spacing[6], gap: spacing[4] }}>
                            <DetailRow
                                icon="person-outline"
                                label="Seller"
                                value={preview?.sellerName ?? "—"}
                                colors={colors}
                                spacing={spacing}
                            />
                            <View style={{ height: 1, backgroundColor: colors.border }} />
                            <DetailRow
                                icon="cube-outline"
                                label="Item"
                                value={preview?.title ?? "—"}
                                colors={colors}
                                spacing={spacing}
                            />
                            <View style={{ height: 1, backgroundColor: colors.border }} />
                            <DetailRow
                                icon="cash-outline"
                                label="Price"
                                value={formatCurrency(preview?.price ?? 0)}
                                valueStyle={{ color: colors.primary, fontWeight: "800", fontSize: 18 }}
                                colors={colors}
                                spacing={spacing}
                            />
                            {preview?.description ? (
                                <>
                                    <View style={{ height: 1, backgroundColor: colors.border }} />
                                    <DetailRow
                                        icon="document-text-outline"
                                        label="Description"
                                        value={preview.description}
                                        colors={colors}
                                        spacing={spacing}
                                    />
                                </>
                            ) : null}
                        </View>

                        {/* Buttons */}
                        <View style={{ paddingHorizontal: spacing[6], paddingBottom: spacing[6], gap: spacing[3] }}>
                            {/* Accept — solid green */}
                            <TouchableOpacity
                                onPress={handleAcceptConfirmed}
                                disabled={isAccepting}
                                activeOpacity={0.85}
                                style={{
                                    backgroundColor: colors.primary,
                                    borderRadius: 14,
                                    paddingVertical: 16,
                                    alignItems: "center",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    gap: 8,
                                }}
                            >
                                {isAccepting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                                            Accept Trade
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Reject — transparent with green border */}
                            <TouchableOpacity
                                onPress={closePreviewModal}
                                disabled={isAccepting}
                                activeOpacity={0.7}
                                style={{
                                    borderRadius: 14,
                                    borderWidth: 2,
                                    borderColor: colors.primary,
                                    paddingVertical: 14,
                                    alignItems: "center",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    gap: 8,
                                    backgroundColor: "transparent",
                                }}
                            >
                                <Ionicons name="close-circle-outline" size={20} color={colors.primary} />
                                <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 16 }}>
                                    Reject Trade
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

// Small helper component for each detail row
interface DetailRowProps {
    icon: any;
    label: string;
    value: string;
    valueStyle?: object;
    colors: any;
    spacing: any;
}

function DetailRow({ icon, label, value, valueStyle, colors, spacing }: DetailRowProps) {
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing[3] }}>
            <View
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: colors.primary + "18",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 1,
                }}
            >
                <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                    {label}
                </Text>
                <Text style={[{ color: colors.foreground, fontSize: 15, fontWeight: "600" }, valueStyle]}>
                    {value}
                </Text>
            </View>
        </View>
    );
}
