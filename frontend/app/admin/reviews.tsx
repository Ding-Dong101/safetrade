import { View, Text, FlatList } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import ScreenHeader from "@/components/shared/ScreenHeader";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/shared/EmptyState";
import { Ionicons } from "@expo/vector-icons";
import { formatRelativeTime } from "@/utils/formatDate";

const MOCK_REVIEWS = [
    {
        id: "review-001",
        reviewerName: "HP Enrg",
        revieweeId: "seller-001",
        revieweeName: "Graphic Tee",
        rating: 5,
        comment: "Excellent service! Very fast delivery and item was exactly as described.",
        tradeId: "trade-001",
        createdAt: "2026-06-01T10:00:00.000Z",
    },
    {
        id: "review-002",
        reviewerName: "Kobby M",
        revieweeId: "seller-002",
        revieweeName: "Tech Store",
        rating: 4,
        comment: "Good experience overall. Would trade again.",
        tradeId: "trade-002",
        createdAt: "2026-06-02T10:00:00.000Z",
    },
    {
        id: "review-003",
        reviewerName: "Jane Doe",
        revieweeId: "seller-003",
        revieweeName: "Fashion Hub",
        rating: 3,
        comment: "Decent but delivery took longer than expected.",
        tradeId: "trade-003",
        createdAt: "2026-06-03T10:00:00.000Z",
    },
];

const StarRating = ({ rating }: { rating: number }) => {
    const { colors } = useTheme();
    return (
        <View style={{ flexDirection: "row", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                    key={star}
                    name={star <= rating ? "star" : "star-outline"}
                    size={14}
                    color={star <= rating ? colors.warning : colors.muted}
                />
            ))}
        </View>
    );
};

export default function AdminReviews() {
    const { colors, spacing } = useTheme();

    const renderItem = ({ item }: { item: typeof MOCK_REVIEWS[0] }) => (
        <Card
            style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                marginBottom: spacing[3],
                gap: spacing[3],
            }}
        >
            {/* Reviewer */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing[3],
                    }}
                >
                    <Avatar name={item.reviewerName} size={40} />
                    <View>
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 14,
                                fontWeight: "600",
                            }}
                        >
                            {item.reviewerName}
                        </Text>
                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 12,
                            }}
                        >
                            → {item.revieweeName}
                        </Text>
                    </View>
                </View>
                <StarRating rating={item.rating} />
            </View>

            {/* Comment */}
            {item.comment && (
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 13,
                        lineHeight: 20,
                    }}
                >
                    {item.comment}
                </Text>
            )}

            {/* Footer */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Text
                    style={{
                        color: colors.mutedForeground,
                        fontSize: 11,
                    }}
                >
                    Trade: {item.tradeId}
                </Text>
                <Text
                    style={{
                        color: colors.mutedForeground,
                        fontSize: 11,
                    }}
                >
                    {formatRelativeTime(item.createdAt)}
                </Text>
            </View>
        </Card>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title="Reviews" />

            <FlatList
                data={MOCK_REVIEWS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={
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
                                color: colors.foreground,
                                fontSize: 16,
                                fontWeight: "700",
                            }}
                        >
                            All Reviews
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 13 }}>
                            {MOCK_REVIEWS.length} total
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <EmptyState
                        title="No Reviews"
                        message="There are no reviews on the platform yet."
                    />
                }
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: spacing[10],
                }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}