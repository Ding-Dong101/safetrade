import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Share,
    Linking,
    Platform,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/formatCurrency";

interface ShareDealModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    price: number;
    tradeCode: string;
}

export default function ShareDealModal({
    visible,
    onClose,
    title,
    price,
    tradeCode,
}: ShareDealModalProps) {
    const { colors, spacing } = useTheme();

    const formattedPrice = formatCurrency(price);
    const shareMessage = `🛡️ SafeTrade Escrow Protected Deal!\n\n📦 Item: ${title}\n💰 Price: ${formattedPrice}\n🔒 Safe Escrow: Funds are held safely until you inspect & approve the item!\n\n👉 Join Trade Code: ${tradeCode}\nAccept in the SafeTrade app under "Accept Trade".`;

    const handleWhatsAppShare = async () => {
        const encoded = encodeURIComponent(shareMessage);
        const url = `whatsapp://send?text=${encoded}`;
        const webUrl = `https://api.whatsapp.com/send?text=${encoded}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                await Linking.openURL(webUrl);
            }
        } catch {
            await Linking.openURL(webUrl);
        }
    };

    const handleNativeShare = async () => {
        try {
            await Share.share({
                message: shareMessage,
                title: `SafeTrade Deal: ${title}`,
            });
        } catch (err: any) {
            console.error("Share error:", err);
        }
    };

    const handleCopy = async () => {
        await Clipboard.setStringAsync(shareMessage);
        Toast.show({
            type: "success",
            text1: "Deal Info Copied!",
            text2: "Paste it directly in WhatsApp, Telegram, or SMS.",
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            padding: spacing[5],
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                                Share Protected Deal
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="close" size={22} color={colors.muted} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.subtitle, { color: colors.muted }]}>
                        Send this escrow deal to your buyer on WhatsApp or social media so they can buy with 100% confidence.
                    </Text>

                    {/* Deal Preview Card */}
                    <View
                        style={[
                            styles.previewCard,
                            {
                                backgroundColor: colors.cardAlt,
                                borderColor: colors.primary,
                            },
                        ]}
                    >
                        <View style={styles.badgeRow}>
                            <View style={[styles.trustBadge, { backgroundColor: `${colors.primary}20` }]}>
                                <Ionicons name="lock-closed" size={12} color={colors.primary} />
                                <Text style={[styles.trustBadgeText, { color: colors.primary }]}>
                                    100% ESCROW PROTECTED
                                </Text>
                            </View>
                        </View>

                        <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>
                            {title || "Item Name"}
                        </Text>
                        <Text style={[styles.itemPrice, { color: colors.primary }]}>
                            {formattedPrice}
                        </Text>

                        <View style={[styles.codeBox, { borderColor: colors.border }]}>
                            <Text style={[styles.codeLabel, { color: colors.muted }]}>
                                TRADE CODE
                            </Text>
                            <Text style={[styles.codeValue, { color: colors.foreground }]}>
                                {tradeCode}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonStack}>
                        <TouchableOpacity
                            onPress={handleWhatsAppShare}
                            activeOpacity={0.8}
                            style={[styles.actionButton, { backgroundColor: "#25D366" }]}
                        >
                            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>
                                Share on WhatsApp
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleNativeShare}
                            activeOpacity={0.8}
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        >
                            <Ionicons name="share-social" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>
                                More Share Options
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleCopy}
                            activeOpacity={0.8}
                            style={[
                                styles.actionButton,
                                {
                                    backgroundColor: "transparent",
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Ionicons name="copy-outline" size={18} color={colors.foreground} />
                            <Text style={[styles.actionButtonText, { color: colors.foreground }]}>
                                Copy Formatted Text
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    container: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 24,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    headerTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 16,
    },
    previewCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1.5,
        marginBottom: 18,
    },
    badgeRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    trustBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    trustBadgeText: {
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 12,
    },
    codeBox: {
        borderTopWidth: 1,
        paddingTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    codeLabel: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
    },
    codeValue: {
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 2,
    },
    buttonStack: {
        gap: 10,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 13,
        borderRadius: 14,
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
});
