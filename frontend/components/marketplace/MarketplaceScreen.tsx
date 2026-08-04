import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { parseLink } from "@/services/linkService";
import { setInspectionData } from "@/services/inspectStore";
import { getTrades } from "@/services/tradeService";
import { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/formatCurrency";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ScreenHeader from "@/components/shared/ScreenHeader";

// Supported platforms strictly limited to Ghanaian e-commerce (Jiji Ghana, Facebook, Tonaton)
const SUPPORTED_PLATFORMS = [
    { id: "jiji", label: "Jiji Ghana (jiji.com.gh)", icon: "cart-outline", domain: "jiji.com.gh", tip: "Copy link from the share icon on the Jiji Ghana product page" },
    { id: "facebook", label: "Facebook Marketplace", icon: "logo-facebook", domain: "facebook.com", tip: "Copy link from Facebook Marketplace listing share button" },
    { id: "tonaton", label: "Tonaton Ghana", icon: "pricetag-outline", domain: "tonaton.com", tip: "Copy product page link or share URL from Tonaton" },
];

export default function MarketplaceScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { user } = useAuth();

    const [inputUrl, setInputUrl] = useState("");
    const [isInspecting, setIsInspecting] = useState(false);

    // Recent Protected Trades
    const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
    const [isLoadingTrades, setIsLoadingTrades] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadRecentTrades = useCallback(async () => {
        try {
            setIsLoadingTrades(true);
            const trades = await getTrades("buyer");
            setRecentTrades(trades.slice(0, 10));
        } catch (err) {
            console.error("Failed to load user trades:", err);
        } finally {
            setIsLoadingTrades(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadRecentTrades();
    }, [loadRecentTrades]);

    const handlePasteClipboard = async () => {
        try {
            const hasString = await Clipboard.hasStringAsync();
            if (hasString) {
                const text = await Clipboard.getStringAsync();
                if (text && text.trim()) {
                    setInputUrl(text.trim());
                    Toast.show({
                        type: "info",
                        text1: "Link Pasted 📋",
                        text2: "Tap 'Inspect & Secure Deal' to continue",
                    });
                }
            } else {
                Toast.show({
                    type: "info",
                    text1: "Clipboard Empty",
                    text2: "Copy a product URL from Jiji Ghana, Facebook, or Tonaton.",
                });
            }
        } catch {
            Toast.show({
                type: "error",
                text1: "Paste Failed",
                text2: "Please paste the link manually into the box.",
            });
        }
    };

    const handleInspectLink = async () => {
        const cleanUrl = inputUrl.trim();
        if (!cleanUrl) {
            Toast.show({
                type: "error",
                text1: "Enter a URL",
                text2: "Please paste a Jiji Ghana, Facebook Marketplace, or Tonaton item link.",
            });
            return;
        }

        const lowerUrl = cleanUrl.toLowerCase();
        // Validate Ghana for Jiji
        if ((lowerUrl.includes("jiji") || lowerUrl.includes("jiji.")) && !lowerUrl.includes("jiji.com.gh")) {
            Alert.alert(
                "Ghana Listings Only 🇬🇭",
                "SafeTrade operates exclusively in Ghana. For Jiji, please use listings from Jiji Ghana (jiji.com.gh)."
            );
            return;
        }

        try {
            setIsInspecting(true);
            const data = await parseLink(cleanUrl);
            setInspectionData(data);
            setInputUrl("");
            router.push("/marketplace-inspect" as any);
        } catch (err: any) {
            const errorMsg = err?.message || "Failed to inspect link. Proceeding with manual escrow creation.";
            if (errorMsg.includes("Ghana")) {
                Alert.alert("Ghana Listings Only 🇬🇭", errorMsg);
                return;
            }
            // If parsing failed gracefully, still allow user to enter details on the dedicated screen
            setInspectionData({
                url: cleanUrl,
                title: "Marketplace Item",
                description: "",
                image: null,
                price: null,
                listedPrice: null,
                sellerContact: null,
                sellerLocation: "Ghana",
                currency: "GHS",
                platform: "Ghana Marketplace",
                domain: cleanUrl,
                isSuccess: true,
            });
            setInputUrl("");
            router.push("/marketplace-inspect" as any);
        } finally {
            setIsInspecting(false);
        }
    };

    const handlePlatformChipPress = (item: typeof SUPPORTED_PLATFORMS[0]) => {
        Alert.alert(`${item.label} Link Tip`, item.tip, [
            { text: "Got it" },
            { text: "Paste Link", onPress: handlePasteClipboard },
        ]);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader
                title="Universal Escrow Hub"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => {
                            setIsRefreshing(true);
                            loadRecentTrades();
                        }}
                        tintColor={colors.primary}
                    />
                }
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[3],
                    paddingBottom: insets.bottom + 90,
                }}
            >
                {/* ── Hero URL Paste & Search Box ── */}
                <Card
                    style={{
                        padding: spacing[4],
                        marginBottom: spacing[4],
                        borderWidth: 1.5,
                        borderColor: `${colors.primary}40`,
                        backgroundColor: colors.card,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing[2] }}>
                        <View
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor: `${colors.primary}20`,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons name="link" size={16} color={colors.primary} />
                        </View>
                        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800" }}>
                            Paste Marketplace Listing Link
                        </Text>
                    </View>

                    <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18, marginBottom: spacing[3] }}>
                        Found an item in Ghana on Jiji, Facebook Marketplace, or Tonaton? Paste the link to lock payment in Escrow.
                    </Text>

                    {/* Input Field + 1-Tap Paste Button */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: colors.cardAlt,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 14,
                            paddingHorizontal: spacing[3],
                            height: 48,
                            gap: 8,
                            marginBottom: spacing[3],
                        }}
                    >
                        <Ionicons name="globe-outline" size={18} color={colors.muted} />
                        <TextInput
                            value={inputUrl}
                            onChangeText={setInputUrl}
                            placeholder="e.g. jiji.com.gh/item/... or tonaton.com/..."
                            placeholderTextColor={colors.muted}
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={{
                                flex: 1,
                                color: colors.foreground,
                                fontSize: 13,
                            }}
                        />

                        {inputUrl.length > 0 ? (
                            <TouchableOpacity onPress={() => setInputUrl("")} style={{ padding: 4 }}>
                                <Ionicons name="close-circle" size={18} color={colors.muted} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={handlePasteClipboard}
                                activeOpacity={0.7}
                                style={{
                                    backgroundColor: `${colors.primary}15`,
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                    borderRadius: 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <Ionicons name="clipboard-outline" size={13} color={colors.primary} />
                                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>Paste</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Inspect Link CTA Button */}
                    <Button
                        label="Inspect & Secure Deal 🔍"
                        onPress={handleInspectLink}
                        isLoading={isInspecting}
                        disabled={!inputUrl.trim()}
                    />

                    {/* Supported Platforms (Jiji Ghana, Facebook, Tonaton) */}
                    <View style={{ marginTop: spacing[3] }}>
                        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", marginBottom: 6 }}>
                            SUPPORTED PLATFORMS IN GHANA:
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            {SUPPORTED_PLATFORMS.map((plat) => (
                                <TouchableOpacity
                                    key={plat.id}
                                    onPress={() => handlePlatformChipPress(plat)}
                                    activeOpacity={0.7}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 6,
                                        backgroundColor: colors.cardAlt,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        paddingHorizontal: 12,
                                        paddingVertical: 7,
                                        borderRadius: 10,
                                    }}
                                >
                                    <Ionicons name={plat.icon as any} size={14} color={colors.primary} />
                                    <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700" }}>
                                        {plat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Card>

                {/* ── Visual 3-Step Trust Guide ── */}
                <Card style={{ padding: spacing[4], marginBottom: spacing[4], backgroundColor: colors.cardAlt }}>
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "800", marginBottom: spacing[3] }}>
                        How SafeTrade Escrow Works in Ghana 🛡️
                    </Text>

                    <View style={{ gap: spacing[3] }}>
                        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                            <View
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: colors.primary,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text style={{ color: colors.background, fontSize: 12, fontWeight: "800" }}>1</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>
                                    Paste Jiji Ghana, Facebook, or Tonaton Link
                                </Text>
                                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 1 }}>
                                    SafeTrade fetches item photos, listed price in Cedis, and seller details.
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                            <View
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: colors.primary,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text style={{ color: colors.background, fontSize: 12, fontWeight: "800" }}>2</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>
                                    Review Details & Set Agreed Cedis Price
                                </Text>
                                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 1 }}>
                                    Choose Hub, Rider, or Handover delivery. Deposit Cedis into escrow and send the Trade Code.
                                </Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                            <View
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: colors.primary,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text style={{ color: colors.background, fontSize: 12, fontWeight: "800" }}>3</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>
                                    Inspect Package & Release Payment
                                </Text>
                                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 1 }}>
                                    Physically verify the product before giving your 5-digit release code.
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* ── Recent Protected Trades Section ── */}
                <View style={{ marginTop: spacing[2], marginBottom: spacing[4] }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[3] }}>
                        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800" }}>
                            Your Protected Deals
                        </Text>
                        <TouchableOpacity onPress={loadRecentTrades}>
                            <Ionicons name="refresh" size={18} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {isLoadingTrades && recentTrades.length === 0 ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
                    ) : recentTrades.length === 0 ? (
                        <Card style={{ padding: spacing[5], alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <Ionicons name="shield-outline" size={36} color={colors.muted} />
                            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>
                                No Active Escrow Deals
                            </Text>
                            <Text style={{ color: colors.muted, fontSize: 12, textAlign: "center" }}>
                                Paste a Jiji Ghana, Facebook, or Tonaton URL above to initiate your first protected trade in Cedis.
                            </Text>
                        </Card>
                    ) : (
                        recentTrades.map((t) => (
                            <Card
                                key={t.id}
                                onPress={() => router.push(`/trade/${t.id}` as any)}
                                style={{
                                    marginBottom: spacing[3],
                                    padding: spacing[3],
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <View style={{ flex: 1, marginRight: spacing[2], gap: 4 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "800" }} numberOfLines={1}>
                                            {t.title || "Marketplace Escrow Trade"}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>
                                            {formatCurrency(t.price, "GHS")}
                                        </Text>
                                        {t.tradeCode && (
                                            <Text style={{ color: colors.muted, fontSize: 11 }}>
                                                Code: {t.tradeCode}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <View
                                    style={{
                                        backgroundColor: `${colors.primary}18`,
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        borderRadius: 8,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>
                                        {t.status.replace("_", " ")}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                                </View>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
