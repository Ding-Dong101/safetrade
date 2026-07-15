import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";
import { useTrades } from "@/hooks/useTrades";
import { useEffect } from "react";
import ScreenHeader from "@/components/shared/ScreenHeader";
import TradeStatusBadge from "@/components/trade/TradeStatusBadge";
import TradeStatusBar from "@/components/trade/TradeStatusBar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDate";
import Card from "@/components/ui/Card";

export default function TradeDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { selectedTrade, isLoading, fetchTradeById } = useTrades();

    useEffect(() => {
        if (id) fetchTradeById(id);
    }, [id]);

    if (isLoading) return <LoadingSpinner message="Loading trade..." />;

    if (!selectedTrade) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text style={{ color: colors.muted }}>Trade not found</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title="Trade Details" />

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: spacing[10],
                    gap: spacing[4],
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Status */}
                <Card>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: spacing[3],
                        }}
                    >
                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 13,
                            }}
                        >
                            Trade Status
                        </Text>
                        <TradeStatusBadge status={selectedTrade.status} />
                    </View>
                    <TradeStatusBar status={selectedTrade.status} />
                </Card>

                {/* Amount */}
                <Card>
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
                        {formatCurrency(selectedTrade.price)}
                    </Text>
                </Card>

                {/* Details */}
                <Card style={{ gap: spacing[3] }}>
                    {[
                        {
                            label: "Buyer",
                            value: selectedTrade.buyerId || "—",
                        },
                        {
                            label: "Seller",
                            value: selectedTrade.sellerId || "—",
                        },
                        {
                            label: "Created",
                            value: formatDateTime(selectedTrade.createdAt),
                        },
                        {
                            label: "Trade ID",
                            value: selectedTrade.id,
                        },
                    ].map((item) => (
                        <View
                            key={item.label}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.muted,
                                    fontSize: 13,
                                }}
                            >
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
                {selectedTrade.description && (
                    <Card>
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
                            {selectedTrade.description}
                        </Text>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
}