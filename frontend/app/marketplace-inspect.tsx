import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Modal,
    Alert,
    StyleSheet,
    ScrollView,
    Share,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useTrades } from "@/hooks/useTrades";
import { getInspectionData, setInspectionData } from "@/services/inspectStore";
import { LinkPreviewData } from "@/services/linkService";
import { createBuyerTrade } from "@/services/tradeService";
import { getRepresentativeOnlineImage } from "@/utils/imageLookup";
import { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/formatCurrency";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type DeliveryMode = "hub" | "rider" | "handover";

const DELIVERY_OPTIONS: { id: DeliveryMode; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
        id: "hub",
        title: "SafeTrade Hub Delivery (Recommended)",
        subtitle: "Seller drops off at nearest SafeTrade Post. Inspect & collect securely.",
        icon: "business-outline",
    },
    {
        id: "rider",
        title: "Direct Dispatch Rider",
        subtitle: "Verified SafeTrade dispatch rider picks up and delivers to your doorstep.",
        icon: "bicycle-outline",
    },
    {
        id: "handover",
        title: "Direct In-Person Handover",
        subtitle: "Meet seller in person; money released only with your 5-digit release code.",
        icon: "people-outline",
    },
];

export default function MarketplaceInspectScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { user } = useAuth();
    const { refetch: refetchUserTrades } = useTrades();

    const [previewData, setPreviewDataState] = useState<LinkPreviewData | null>(null);

    // Form inputs & Photo State
    const [itemPhoto, setItemPhoto] = useState<string | null>(null);
    const [isOnlineFallback, setIsOnlineFallback] = useState(false);
    const [editableTitle, setEditableTitle] = useState("");
    const [listedPrice, setListedPrice] = useState<number | null>(null);
    const [agreedPrice, setAgreedPrice] = useState("");
    const [sellerContact, setSellerContact] = useState("");
    const [sellerLocation, setSellerLocation] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [attributes, setAttributes] = useState<Record<string, string>>({});
    const [showAllAttributes, setShowAllAttributes] = useState(false);
    const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("hub");
    const [deliveryLocation, setDeliveryLocation] = useState("");
    const [showFullDesc, setShowFullDesc] = useState(true);

    // Trade creation state
    const [isCreatingTrade, setIsCreatingTrade] = useState(false);
    const [createdTrade, setCreatedTrade] = useState<{ trade: Trade; tradeCode: string } | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        const data = getInspectionData();
        if (data) {
            setPreviewDataState(data);
            const title = data.title || "Marketplace Item";
            setEditableTitle(title);
            setListedPrice(data.listedPrice ?? data.price ?? null);
            setAgreedPrice(data.price ? data.price.toString() : "");
            setSellerContact(data.sellerContact || "");
            setSellerLocation(data.sellerLocation || "Spintex, Greater Accra, Ghana");
            setItemDescription(data.description || "");
            setAttributes(data.attributes || {});

            if (data.image) {
                setItemPhoto(data.image);
                setIsOnlineFallback(false);
            } else {
                setItemPhoto(getRepresentativeOnlineImage(title));
                setIsOnlineFallback(true);
            }
        } else {
            const defaultTitle = "Marketplace Item";
            setEditableTitle(defaultTitle);
            setSellerLocation("Greater Accra, Ghana");
            setItemPhoto(getRepresentativeOnlineImage(defaultTitle));
            setIsOnlineFallback(true);
        }
    }, []);

    const handleImageError = () => {
        // If original image fails to load, resolve specific representative online image from item title
        const fallback = getRepresentativeOnlineImage(editableTitle);
        setItemPhoto(fallback);
        setIsOnlineFallback(true);
    };

    const handleTitleChange = (newTitle: string) => {
        setEditableTitle(newTitle);
        if (isOnlineFallback) {
            setItemPhoto(getRepresentativeOnlineImage(newTitle));
        }
    };

    const handlePickPhoto = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Needed", "Please grant access to your photo library to select an item picture.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const base64Uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
                setItemPhoto(base64Uri);
                setIsOnlineFallback(false);
                Toast.show({
                    type: "success",
                    text1: "Photo Updated 📸",
                    text2: "Item image attached to this escrow deal.",
                });
            }
        } catch (err) {
            Alert.alert("Error", "Could not pick image. Please try again.");
        }
    };

    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Needed", "Please grant access to camera to snap an item picture.");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const base64Uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
                setItemPhoto(base64Uri);
                setIsOnlineFallback(false);
                Toast.show({
                    type: "success",
                    text1: "Photo Captured 📸",
                    text2: "Item photo attached successfully.",
                });
            }
        } catch (err) {
            Alert.alert("Error", "Could not capture image. Please try again.");
        }
    };

    const handlePhotoOptions = () => {
        Alert.alert("Item Photo", "Choose an option to update item photo:", [
            { text: "Take Photo 📷", onPress: handleTakePhoto },
            { text: "Choose from Gallery 🖼️", onPress: handlePickPhoto },
            {
                text: "Use Online Photo (from Title) 🌐",
                onPress: () => {
                    setItemPhoto(getRepresentativeOnlineImage(editableTitle));
                    setIsOnlineFallback(true);
                },
            },
            { text: "Cancel", style: "cancel" },
        ]);
    };

    const handleCreateEscrowTrade = async () => {
        if (!user) {
            Alert.alert("Sign In Required", "Please log in to initiate an escrow trade.");
            return;
        }

        const priceNum = parseFloat(agreedPrice.replace(/[^0-9.]/g, ""));
        if (isNaN(priceNum) || priceNum <= 0) {
            Alert.alert("Agreed Price Required", "Please enter the agreed price in Ghana Cedis (GH₵) for this trade.");
            return;
        }

        if (!editableTitle.trim()) {
            Alert.alert("Title Required", "Please provide a name or title for the item.");
            return;
        }

        try {
            setIsCreatingTrade(true);

            // Construct delivery location label
            const modeLabel = deliveryMode === "hub"
                ? `SafeTrade Hub Delivery: ${deliveryLocation.trim() || "Nearest SafeTrade Post"}`
                : deliveryMode === "rider"
                ? `Direct Dispatch Rider: ${deliveryLocation.trim() || "Buyer Address"}`
                : `In-Person Handover: ${deliveryLocation.trim() || "Agreed Public Meeting Spot"}`;

            const attributesList = Object.entries(attributes)
                .map(([k, v]) => `• ${k}: ${v}`)
                .join("\n");

            const fullDescription = [
                attributesList ? `Item Specifications:\n${attributesList}` : "",
                itemDescription.trim() ? `Seller Details:\n${itemDescription.trim()}` : "",
                sellerLocation.trim() ? `Seller Location: ${sellerLocation.trim()}` : "",
                sellerContact.trim() ? `Seller Contact: ${sellerContact.trim()}` : "",
                listedPrice ? `Original Listed Price: GH₵ ${listedPrice.toFixed(2)}` : "",
            ].filter(Boolean).join("\n\n");

            const finalPhoto = itemPhoto || getRepresentativeOnlineImage(editableTitle);

            const result = await createBuyerTrade({
                title: editableTitle.trim(),
                price: priceNum,
                buyerId: user.id,
                sellerContact: sellerContact.trim() || undefined,
                description: fullDescription,
                pickupLocation: modeLabel,
                sourceUrl: previewData?.url || "",
                platform: previewData?.platform || "Marketplace Listing",
                itemPhotoBase64: finalPhoto || undefined,
            });

            setCreatedTrade({ trade: result.trade, tradeCode: result.tradeCode });
            setShowShareModal(true);
            setInspectionData(null);
            await refetchUserTrades();
        } catch (err: any) {
            const msg = typeof err?.response?.data === "string"
                ? err.response.data
                : (err?.message ?? "Failed to create escrow trade");
            Alert.alert("Trade Creation Failed", msg);
        } finally {
            setIsCreatingTrade(false);
        }
    };

    const handleShareWhatsApp = async () => {
        if (!createdTrade) return;
        const { trade, tradeCode } = createdTrade;
        const message =
            `🛡️ *SafeTrade Escrow Deal Created*\n\n` +
            `Hello! I want to buy *"${trade.title}"* from you for *${formatCurrency(trade.price, "GHS")}*.\n\n` +
            `I have initiated 100% Escrow Protection on SafeTrade. Your payment is held safely in escrow and will be released to you upon delivery.\n\n` +
            `👉 Open SafeTrade and enter Trade Code: *${tradeCode}* to accept and arrange delivery!\n` +
            `Link: https://safetrade.app/trade/${tradeCode}`;

        try {
            const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                await Share.share({ message });
            }
        } catch {
            await Share.share({ message });
        }
    };

    const handleCopyInviteMessage = async () => {
        if (!createdTrade) return;
        const { trade, tradeCode } = createdTrade;
        const message =
            `🛡️ *SafeTrade Escrow Deal Created*\n\n` +
            `Item: ${trade.title}\n` +
            `Agreed Price: ${formatCurrency(trade.price, "GHS")}\n` +
            `Trade Code: ${tradeCode}\n` +
            `Join on SafeTrade: https://safetrade.app/trade/${tradeCode}`;

        await Clipboard.setStringAsync(message);
        Toast.show({
            type: "success",
            text1: "Invite Copied! 📋",
            text2: "Send this message to the seller on WhatsApp/DM.",
        });
    };

    const attributeEntries = Object.entries(attributes);
    const visibleAttributes = showAllAttributes ? attributeEntries : attributeEntries.slice(0, 6);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* ── Top App Bar ── */}
            <View
                style={{
                    paddingTop: insets.top + 8,
                    paddingBottom: spacing[3],
                    paddingHorizontal: spacing[4],
                    backgroundColor: colors.card,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: colors.cardAlt,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.foreground} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800" }}>
                        Marketplace Inspection
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                        {previewData?.platform || "Ghana Marketplace"}
                    </Text>
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: `${colors.primary}18`,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                    }}
                >
                    <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "800" }}>
                        GHANA
                    </Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: insets.bottom + 60,
                    gap: spacing[4],
                }}
            >
                {/* ── 1. Inspected Product Hero Card ── */}
                <Card
                    style={{
                        padding: 0,
                        overflow: "hidden",
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    {/* Item Photo Area */}
                    <View style={{ position: "relative", width: "100%", height: 240, backgroundColor: colors.cardAlt }}>
                        <Image
                            source={{ uri: itemPhoto || getRepresentativeOnlineImage(editableTitle) }}
                            onError={handleImageError}
                            style={{
                                width: "100%",
                                height: "100%",
                                resizeMode: "cover",
                            }}
                        />

                        {/* Representative Online Photo Tag */}
                        {isOnlineFallback && (
                            <View
                                style={{
                                    position: "absolute",
                                    top: 12,
                                    left: 12,
                                    backgroundColor: "rgba(0,0,0,0.75)",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 5,
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 12,
                                }}
                            >
                                <Ionicons name="globe-outline" size={13} color={colors.primary} />
                                <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
                                    Web Representative Photo
                                </Text>
                            </View>
                        )}

                        {/* Change/Replace Photo Overlay Button */}
                        <TouchableOpacity
                            onPress={handlePhotoOptions}
                            activeOpacity={0.8}
                            style={{
                                position: "absolute",
                                bottom: 12,
                                right: 12,
                                backgroundColor: "rgba(0,0,0,0.8)",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                paddingHorizontal: 12,
                                paddingVertical: 7,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.2)",
                            }}
                        >
                            <Ionicons name="camera" size={15} color="#FFFFFF" />
                            <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "800" }}>
                                Change / Snap Photo
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ padding: spacing[4], gap: spacing[3] }}>
                        {/* Title & Promotion/Verification Header */}
                        <View>
                            <TextInput
                                value={editableTitle}
                                onChangeText={handleTitleChange}
                                placeholder="Enter item name..."
                                placeholderTextColor={colors.muted}
                                multiline
                                style={{
                                    color: colors.foreground,
                                    fontSize: 18,
                                    fontWeight: "800",
                                    lineHeight: 24,
                                    padding: 0,
                                }}
                            />

                            {/* Location & Platform Tag Row (Matching Jiji Layout) */}
                            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 }}>
                                <View
                                    style={{
                                        backgroundColor: `${colors.primary}18`,
                                        paddingHorizontal: 8,
                                        paddingVertical: 3,
                                        borderRadius: 6,
                                    }}
                                >
                                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "800" }}>
                                        {previewData?.platform || "Jiji Ghana"}
                                    </Text>
                                </View>

                                {/* Exact Location Badge */}
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <Ionicons name="location-sharp" size={14} color={colors.primary} />
                                    <TextInput
                                        value={sellerLocation}
                                        onChangeText={setSellerLocation}
                                        placeholder="e.g. Spintex, Greater Accra, Ghana"
                                        placeholderTextColor={colors.muted}
                                        style={{
                                            color: colors.muted,
                                            fontSize: 12,
                                            fontWeight: "700",
                                            padding: 0,
                                        }}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* ── 2. Specifications & Attributes Grid (Jiji Style 2-Column Grid) ── */}
                        {attributeEntries.length > 0 && (
                            <View
                                style={{
                                    backgroundColor: colors.cardAlt,
                                    borderRadius: 12,
                                    padding: spacing[3],
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    gap: 10,
                                    marginTop: 4,
                                }}
                            >
                                <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.5 }}>
                                    ITEM SPECIFICATIONS
                                </Text>

                                <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 12, columnGap: 12 }}>
                                    {visibleAttributes.map(([key, val], idx) => (
                                        <View key={idx} style={{ width: "47%" }}>
                                            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "800" }} numberOfLines={1}>
                                                {val}
                                            </Text>
                                            <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", marginTop: 2 }}>
                                                {key}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {attributeEntries.length > 6 && (
                                    <TouchableOpacity
                                        onPress={() => setShowAllAttributes(!showAllAttributes)}
                                        style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end", marginTop: 2 }}
                                    >
                                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "800" }}>
                                            {showAllAttributes ? "Show less" : "Show more"}
                                        </Text>
                                        <Ionicons
                                            name={showAllAttributes ? "chevron-up" : "chevron-down"}
                                            size={14}
                                            color={colors.primary}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Listed Price & Seller Contact Row */}
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            {/* Listed Price */}
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: colors.cardAlt,
                                    padding: spacing[3],
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                }}
                            >
                                <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "700" }}>
                                    ORIGINAL LISTED PRICE
                                </Text>
                                <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "800", marginTop: 2 }}>
                                    {listedPrice !== null ? formatCurrency(listedPrice, "GHS") : "Not specified"}
                                </Text>
                            </View>

                            {/* Seller Contact */}
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: colors.cardAlt,
                                    padding: spacing[3],
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                }}
                            >
                                <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "700" }}>
                                    SELLER CONTACT
                                </Text>
                                <TextInput
                                    value={sellerContact}
                                    onChangeText={setSellerContact}
                                    placeholder="e.g. 0241234567"
                                    placeholderTextColor={colors.muted}
                                    keyboardType="phone-pad"
                                    style={{
                                        color: colors.foreground,
                                        fontSize: 14,
                                        fontWeight: "700",
                                        marginTop: 2,
                                        padding: 0,
                                    }}
                                />
                            </View>
                        </View>

                        {/* Seller Provided Description Box */}
                        {itemDescription ? (
                            <View
                                style={{
                                    backgroundColor: colors.cardAlt,
                                    borderRadius: 12,
                                    padding: spacing[3],
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => setShowFullDesc(!showFullDesc)}
                                    style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                                >
                                    <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "800" }}>
                                        DETAILS & DESCRIPTION FROM SELLER
                                    </Text>
                                    <Ionicons
                                        name={showFullDesc ? "chevron-up" : "chevron-down"}
                                        size={16}
                                        color={colors.muted}
                                    />
                                </TouchableOpacity>
                                <Text
                                    numberOfLines={showFullDesc ? undefined : 4}
                                    style={{ color: colors.foreground, fontSize: 13, lineHeight: 20, marginTop: 8 }}
                                >
                                    {itemDescription}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </Card>

                {/* ── 3. Escrow Deal Agreement & Final Price Card ── */}
                <Card
                    style={{
                        padding: spacing[4],
                        backgroundColor: colors.card,
                        borderWidth: 1.5,
                        borderColor: colors.primary,
                        gap: spacing[3],
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Ionicons name="shield" size={18} color={colors.primary} />
                        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800" }}>
                            Escrow Deal Agreement
                        </Text>
                    </View>

                    {/* Agreed Price Input in Ghana Cedis */}
                    <View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700" }}>
                                AGREED FINAL PRICE (GH₵ CEDIS)
                            </Text>
                            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "800" }}>
                                Escrow Protected
                            </Text>
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: colors.cardAlt,
                                borderWidth: 1.5,
                                borderColor: colors.primary,
                                borderRadius: 12,
                                paddingHorizontal: 12,
                            }}
                        >
                            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "900", marginRight: 8 }}>
                                GH₵
                            </Text>
                            <TextInput
                                value={agreedPrice}
                                onChangeText={setAgreedPrice}
                                placeholder="e.g. 1850.00"
                                placeholderTextColor={colors.muted}
                                keyboardType="numeric"
                                style={{
                                    flex: 1,
                                    color: colors.foreground,
                                    fontSize: 18,
                                    fontWeight: "800",
                                    paddingVertical: 10,
                                }}
                            />
                        </View>
                        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
                            Enter the final price you and the seller agreed upon in Ghana Cedis.
                        </Text>
                    </View>

                    {/* Mode of Delivery (Radio Button Selector) */}
                    <View style={{ marginTop: spacing[1] }}>
                        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", marginBottom: 8 }}>
                            MODE OF DELIVERY
                        </Text>
                        <View style={{ gap: 8 }}>
                            {DELIVERY_OPTIONS.map((opt) => {
                                const isSelected = deliveryMode === opt.id;
                                return (
                                    <TouchableOpacity
                                        key={opt.id}
                                        onPress={() => setDeliveryMode(opt.id)}
                                        activeOpacity={0.8}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "flex-start",
                                            backgroundColor: isSelected ? `${colors.primary}12` : colors.cardAlt,
                                            borderWidth: 1.5,
                                            borderColor: isSelected ? colors.primary : colors.border,
                                            borderRadius: 12,
                                            padding: spacing[3],
                                            gap: 10,
                                        }}
                                    >
                                        <Ionicons
                                            name={isSelected ? "radio-button-on" : "radio-button-off"}
                                            size={20}
                                            color={isSelected ? colors.primary : colors.muted}
                                            style={{ marginTop: 2 }}
                                        />

                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                <Ionicons name={opt.icon} size={15} color={isSelected ? colors.primary : colors.foreground} />
                                                <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "800" }}>
                                                    {opt.title}
                                                </Text>
                                            </View>
                                            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 3, lineHeight: 16 }}>
                                                {opt.subtitle}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Delivery / Destination Address */}
                    <View>
                        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", marginBottom: 4 }}>
                            {deliveryMode === "hub"
                                ? "PREFERRED SAFETRADE POST / HUB (OPTIONAL)"
                                : deliveryMode === "rider"
                                ? "DELIVERY DESTINATION ADDRESS (OPTIONAL)"
                                : "PUBLIC MEETING SPOT (OPTIONAL)"}
                        </Text>
                        <TextInput
                            value={deliveryLocation}
                            onChangeText={setDeliveryLocation}
                            placeholder={
                                deliveryMode === "hub"
                                    ? "e.g. Spintex SafeTrade Hub, Accra Central..."
                                    : deliveryMode === "rider"
                                    ? "e.g. 14 Ring Road East, Osu, Accra"
                                    : "e.g. Accra Mall Main Entrance"
                            }
                            placeholderTextColor={colors.muted}
                            style={{
                                backgroundColor: colors.cardAlt,
                                color: colors.foreground,
                                fontSize: 13,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: colors.border,
                            }}
                        />
                    </View>

                    {/* Escrow Guarantee Box */}
                    <View
                        style={{
                            backgroundColor: `${colors.primary}10`,
                            borderWidth: 1,
                            borderColor: `${colors.primary}30`,
                            borderRadius: 12,
                            padding: spacing[3],
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <Ionicons name="lock-closed" size={20} color={colors.primary} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700" }}>
                                100% Escrow Protection Guaranteed
                            </Text>
                            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                                Your money is held safely in escrow. The seller is only paid after you inspect and accept the item.
                            </Text>
                        </View>
                    </View>

                    {/* Submit Escrow Button */}
                    <Button
                        label="Lock Escrow Deal & Generate Code 🛡️"
                        onPress={handleCreateEscrowTrade}
                        isLoading={isCreatingTrade}
                    />
                </Card>
            </ScrollView>

            {/* ── Share & Invite Seller Modal ── */}
            <Modal
                visible={showShareModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowShareModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing[5], gap: spacing[4] }}>
                            <View style={{ alignItems: "center", gap: 6 }}>
                                <View
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 28,
                                        backgroundColor: `${colors.primary}20`,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Ionicons name="checkmark-circle" size={36} color={colors.primary} />
                                </View>
                                <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>
                                    Escrow Trade Created! 🎉
                                </Text>
                                <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center", maxWidth: 300 }}>
                                    Share the trade code with the seller so they can accept and dispatch your item.
                                </Text>
                            </View>

                            {/* Trade Code Box */}
                            <View
                                style={{
                                    backgroundColor: colors.cardAlt,
                                    borderRadius: 16,
                                    padding: spacing[4],
                                    alignItems: "center",
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    gap: 6,
                                }}
                            >
                                <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "700" }}>
                                    SELLER INVITATION CODE
                                </Text>
                                <Text style={{ color: colors.primary, fontSize: 32, fontWeight: "900", letterSpacing: 4 }}>
                                    {createdTrade?.tradeCode}
                                </Text>
                                <Text style={{ color: colors.muted, fontSize: 11 }}>
                                    Give this code to the seller to join this trade.
                                </Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={{ gap: spacing[2] }}>
                                <TouchableOpacity
                                    onPress={handleShareWhatsApp}
                                    activeOpacity={0.8}
                                    style={{
                                        backgroundColor: "#25D366",
                                        borderRadius: 14,
                                        paddingVertical: 14,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                    }}
                                >
                                    <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                                    <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "800" }}>
                                        Share Invite to WhatsApp
                                    </Text>
                                </TouchableOpacity>

                                <Button
                                    label="Copy Invite Message 📋"
                                    variant="secondary"
                                    onPress={handleCopyInviteMessage}
                                />

                                <Button
                                    label="Proceed to Escrow Payment 🛡️"
                                    onPress={() => {
                                        setShowShareModal(false);
                                        if (createdTrade) {
                                            router.replace(`/trade/${createdTrade.trade.id}` as any);
                                        }
                                    }}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "flex-end",
    },
    modalContent: {
        width: "100%",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 1,
        maxHeight: "85%",
    },
});
