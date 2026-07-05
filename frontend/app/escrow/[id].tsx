import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import ScreenHeader from "@/components/shared/ScreenHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDate";

const MOCK_ESCROW = {
    id: "escrow-001",
    itemName: "MacBook Pro M4",
    amount: 8450.00,
    currency: "GHS",
    buyerUsername: "kobby123",
    sellerUsername: "seller_joe",
    sellerEmail: "seller@example.com",
    description: "Used MacBook Pro M4, excellent condition.",
    status: "funds_deposited" as const,
    createdAt: "2026-06-01T10:00:00.000Z",
};

export default function EscrowDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors, spacing } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title="Escrow Details" />

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: spacing[10],
                    gap: spacing[4],
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Info Banner */}
                <View
                    style={{
                        backgroundColor: colors.primary + "15",
                        borderRadius: 12,
                        padding: spacing[4],
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

                {/* Status */}
                <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: colors.muted, fontSize: 13 }}>
                            Status
                        </Text>
                        <Badge label="Funds Deposited" variant="success" />
                    </View>
                </Card>

                {/* Amount */}
                <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 13,
                            marginBottom: spacing[1],
                        }}
                    >
                        Amount
                    </Text>
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 28,
                            fontWeight: "700",
                        }}
                    >
                        {formatCurrency(MOCK_ESCROW.amount)}
                    </Text>
                </Card>

                {/* Details */}
                <Card style={{ backgroundColor: colors.card, borderColor: colors.border, gap: spacing[3] }}>
                    {[
                        { label: "Item", value: MOCK_ESCROW.itemName },
                        { label: "Buyer", value: MOCK_ESCROW.buyerUsername },
                        { label: "Seller", value: MOCK_ESCROW.sellerUsername },
                        { label: "Created", value: formatDateTime(MOCK_ESCROW.createdAt) },
                        { label: "Escrow ID", value: MOCK_ESCROW.id },
                    ].map((item) => (
                        <View
                            key={item.label}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: colors.muted, fontSize: 13 }}>
                                {item.label}
                            </Text>
                            <Text
                                style={{
                                    color: colors.foreground,
                                    fontSize: 13,
                                    fontWeight: "500",
                                    maxWidth: "60%",
                                    textAlign: "right",
                                }}
                            >
                                {item.value}
                            </Text>
                        </View>
                    ))}
                </Card>

                {/* Description */}
                {MOCK_ESCROW.description && (
                    <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 13,
                                marginBottom: spacing[2],
                            }}
                        >
                            Description
                        </Text>
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 14,
                                lineHeight: 22,
                            }}
                        >
                            {MOCK_ESCROW.description}
                        </Text>
                    </Card>
                )}

                {/* Actions */}
                <View style={{ gap: spacing[3] }}>
                    <Button
                        label="Release Funds to Seller"
                        onPress={() => console.log("release funds")}
                        variant="primary"
                    />
                    <Button
                        label="Raise Dispute"
                        onPress={() => console.log("raise dispute")}
                        variant="outlined"
                    />
                </View>
            </ScrollView>
        </View>
    );
}