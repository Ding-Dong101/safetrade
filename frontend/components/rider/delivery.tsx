import { View, Text, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import ScreenHeader from "@/components/shared/ScreenHeader";
import DeliveryCard from "@/components/rider/DeliveryCard";
import AvailableJobCard from "@/components/rider/AvailableJobCard";
import EmptyState from "@/components/shared/EmptyState";
import { RiderJob, AvailableJob } from "@/types/rider";

const MOCK_DELIVERY_JOBS: RiderJob[] = [
    {
        id: "job-003",
        tradeId: "trade-003",
        buyerName: "HP Enrg",
        sellerName: "Graphic Tee",
        pickupLocation: "College Of Science",
        dropoffLocation: "Victory Towers",
        status: "in_transit",
        assignedAt: "2026-06-01T12:00:00.000Z",
    },
];

const MOCK_AVAILABLE_JOBS: AvailableJob[] = [
    {
        id: "job-004",
        tradeId: "trade-004",
        buyerName: "HP Enrg",
        pickupLocation: "College Of Science",
        dropoffLocation: "Victory Towers",
        estimatedDistance: "2.3km",
    },
    {
        id: "job-005",
        tradeId: "trade-005",
        buyerName: "Graphic Tee",
        pickupLocation: "Victory Towers",
        dropoffLocation: "College Of Science",
        estimatedDistance: "1.8km",
    },
];

export default function Delivery() {
    const { colors, spacing } = useTheme();

    const ListHeader = () => (
        <View style={{ gap: spacing[4] }}>
            {/* Delivery Jobs */}
            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 16,
                    fontWeight: "700",
                    textDecorationLine: "underline",
                }}
            >
                Active Deliveries
            </Text>

            {MOCK_DELIVERY_JOBS.map((job) => (
                <DeliveryCard
                    key={job.id}
                    job={job}
                    onConfirm={() => console.log("confirm delivery", job.id)}
                />
            ))}

            {/* Available Jobs Header */}
            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 16,
                    fontWeight: "700",
                    textDecorationLine: "underline",
                    marginTop: spacing[2],
                }}
            >
                Available
            </Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title="Deliveries" showBack={false} />

            <FlatList
                data={MOCK_AVAILABLE_JOBS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <AvailableJobCard
                        job={item}
                        onAccept={() => console.log("accept", item.id)}
                        onIgnore={() => console.log("ignore", item.id)}
                    />
                )}
                ListHeaderComponent={<ListHeader />}
                ListEmptyComponent={
                    <EmptyState
                        title="No Available Jobs"
                        message="There are no available jobs right now."
                    />
                }
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: spacing[20],
                    gap: spacing[3],
                }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}