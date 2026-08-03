import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    Share,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/formatCurrency";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface SafeTradeTrustCenterProps {
    role?: "buyer" | "seller";
}

export default function SafeTradeTrustCenter({ role = "buyer" }: SafeTradeTrustCenterProps) {
    const { colors, spacing } = useTheme();

    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [calcAmount, setCalcAmount] = useState("500");
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // Calculation logic: 1.5% escrow fee, capped at GHS 30
    const parsedAmount = Math.max(0, parseFloat(calcAmount) || 0);
    const escrowFee = Math.min(30, parsedAmount * 0.015);
    const netSellerPayout = Math.max(0, parsedAmount - escrowFee);

    const handleShareReferral = async () => {
        try {
            await Share.share({
                message:
                    "🛡️ Join me on SafeTrade! Trade electronics, fashion, and goods with 100% money-back escrow protection. Zero payment-before-delivery scams! Sign up here: https://safetrade.app",
                title: "SafeTrade 100% Escrow Protection",
            });
        } catch (err: any) {
            console.error("Referral share error:", err);
        }
    };

    return (
        <View style={{ gap: spacing[4], marginTop: spacing[3], marginBottom: spacing[8] }}>
            {/* ── 1. Security & Guarantee Card ── */}
            <Card
                style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: 20,
                    padding: spacing[5],
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: spacing[3],
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 17,
                                backgroundColor: `${colors.primary}18`,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons name="shield-checkmark" size={19} color={colors.primary} />
                        </View>
                        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800" }}>
                            SafeTrade Escrow Shield
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsInfoModalOpen(true)}
                        activeOpacity={0.7}
                        style={{
                            backgroundColor: `${colors.primary}15`,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 10,
                        }}
                    >
                        <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>
                            How It Works
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18, marginBottom: spacing[3] }}>
                    {role === "buyer"
                        ? "Your money is locked in secure escrow until you inspect and approve your package with the rider."
                        : "Sell safely with guaranteed buyer funds already locked in escrow before you hand over any item."}
                </Text>

                {/* 3 Pillars of Security */}
                <View style={{ flexDirection: "row", gap: spacing[2], marginBottom: spacing[3] }}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: colors.cardAlt,
                            borderRadius: 12,
                            padding: spacing[3],
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 11,
                                fontWeight: "700",
                                textAlign: "center",
                                marginTop: 4,
                            }}
                        >
                            100% Locked
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>
                            Escrow vault
                        </Text>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: colors.cardAlt,
                            borderRadius: 12,
                            padding: spacing[3],
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        <Ionicons name="qr-code-outline" size={18} color={colors.primary} />
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 11,
                                fontWeight: "700",
                                textAlign: "center",
                                marginTop: 4,
                            }}
                        >
                            Handover Code
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>
                            Rider verified
                        </Text>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: colors.cardAlt,
                            borderRadius: 12,
                            padding: spacing[3],
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        <Ionicons name="flash-outline" size={18} color={colors.primary} />
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 11,
                                fontWeight: "700",
                                textAlign: "center",
                                marginTop: 4,
                            }}
                        >
                            Instant MoMo
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 10, textAlign: "center" }}>
                            Fast payout
                        </Text>
                    </View>
                </View>

                {/* Open Calculator Button */}
                <TouchableOpacity
                    onPress={() => setIsCalculatorOpen(true)}
                    activeOpacity={0.7}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        paddingVertical: spacing[3],
                        backgroundColor: colors.cardAlt,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <Ionicons name="calculator-outline" size={16} color={colors.primary} />
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>
                        Escrow Fee & Payout Calculator
                    </Text>
                </TouchableOpacity>
            </Card>

            {/* ── 2. Viral Referral & Rewards Card ── */}
            <View
                style={{
                    backgroundColor: `${colors.primary}12`,
                    borderWidth: 1.5,
                    borderColor: `${colors.primary}40`,
                    borderRadius: 20,
                    padding: spacing[4],
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing[3],
                }}
            >
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <Ionicons name="gift-outline" size={16} color={colors.primary} />
                        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "800" }}>
                            Invite Friends, Trade for Free
                        </Text>
                    </View>
                    <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 16 }}>
                        Get 0% escrow fees on your next 3 deals when a friend joins!
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleShareReferral}
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: colors.primary,
                        paddingHorizontal: spacing[4],
                        paddingVertical: spacing[2],
                        borderRadius: 12,
                    }}
                >
                    <Text style={{ color: colors.background, fontSize: 12, fontWeight: "800" }}>
                        Invite
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ── 3. Calculator Modal ── */}
            <Modal
                visible={isCalculatorOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsCalculatorOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                padding: spacing[5],
                            },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Ionicons name="calculator" size={22} color={colors.primary} />
                                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                                    Escrow Calculator
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsCalculatorOpen(false)}>
                                <Ionicons name="close" size={22} color={colors.muted} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: colors.muted, fontSize: 13, marginBottom: spacing[4] }}>
                            Transparent protection fees. No hidden charges.
                        </Text>

                        {/* Amount Input */}
                        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700", marginBottom: 6 }}>
                            Deal Amount (GHS)
                        </Text>
                        <TextInput
                            value={calcAmount}
                            onChangeText={setCalcAmount}
                            keyboardType="numeric"
                            placeholder="e.g. 500"
                            placeholderTextColor={colors.muted}
                            style={{
                                backgroundColor: colors.cardAlt,
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 14,
                                paddingHorizontal: spacing[4],
                                paddingVertical: spacing[3],
                                color: colors.foreground,
                                fontSize: 18,
                                fontWeight: "800",
                                marginBottom: spacing[3],
                            }}
                        />

                        {/* Quick Presets */}
                        <View style={{ flexDirection: "row", gap: 8, marginBottom: spacing[4] }}>
                            {["200", "500", "1500", "5000"].map((preset) => (
                                <TouchableOpacity
                                    key={preset}
                                    onPress={() => setCalcAmount(preset)}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 6,
                                        backgroundColor: calcAmount === preset ? colors.primary : colors.cardAlt,
                                        borderRadius: 8,
                                        alignItems: "center",
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: calcAmount === preset ? "#FFFFFF" : colors.foreground,
                                            fontSize: 12,
                                            fontWeight: "700",
                                        }}
                                    >
                                        GHS {preset}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Breakdown Box */}
                        <View
                            style={{
                                backgroundColor: colors.cardAlt,
                                borderRadius: 16,
                                padding: spacing[4],
                                gap: spacing[3],
                                borderWidth: 1,
                                borderColor: colors.border,
                                marginBottom: spacing[4],
                            }}
                        >
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ color: colors.muted, fontSize: 13 }}>Total Item Value</Text>
                                <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>
                                    {formatCurrency(parsedAmount)}
                                </Text>
                            </View>

                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ color: colors.muted, fontSize: 13 }}>Escrow Protection Fee (1.5%)</Text>
                                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700" }}>
                                    {formatCurrency(escrowFee)}
                                </Text>
                            </View>

                            <View style={{ height: 1, backgroundColor: colors.border }} />

                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "800" }}>
                                    Seller Net Payout
                                </Text>
                                <Text style={{ color: colors.primary, fontSize: 19, fontWeight: "800" }}>
                                    {formatCurrency(netSellerPayout)}
                                </Text>
                            </View>
                        </View>

                        <Button label="Close" onPress={() => setIsCalculatorOpen(false)} />
                    </View>
                </View>
            </Modal>

            {/* ── 4. How It Works Modal ── */}
            <Modal
                visible={isInfoModalOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsInfoModalOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                padding: spacing[5],
                            },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
                                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                                    How SafeTrade Protects You
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsInfoModalOpen(false)}>
                                <Ionicons name="close" size={22} color={colors.muted} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ gap: spacing[3], marginVertical: spacing[3] }}>
                            <View style={{ flexDirection: "row", gap: 12 }}>
                                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                                    <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 12 }}>1</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>
                                        Buyer Deposits to Escrow
                                    </Text>
                                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                                        Funds are held securely by SafeTrade via MoMo or Card. Seller is notified that money is guaranteed.
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: "row", gap: 12 }}>
                                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                                    <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 12 }}>2</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>
                                        Verified Handover with Codes
                                    </Text>
                                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                                        Seller and Rider verify parcel condition with photos and physical dispatch codes.
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: "row", gap: 12 }}>
                                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                                    <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 12 }}>3</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>
                                        Inspect & Release
                                    </Text>
                                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                                        Buyer inspects package upon delivery and provides the delivery code to instantly release funds to the seller.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Button label="Got It" onPress={() => setIsInfoModalOpen(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalCard: {
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
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
    },
    stepNumber: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
});
