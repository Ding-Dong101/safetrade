import { View, Text, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import ScreenHeader from "@/components/shared/ScreenHeader";
import DispatchCard from "@/components/rider/DispatchCard";
import EmptyState from "@/components/shared/EmptyState";
import { RiderJob } from "@/types/rider";

const MOCK_ONGOING_JOBS: RiderJob[] = [
    {
        id: "job-001",
        tradeId: "trade-001",
        buyerName: "HP Enrg",
        sellerName: "Graphic Tee",
        pickupLocation: "College Of Science",
        dropoffLocation: "Victory Towers",
        status: "pending_dispatch",
        assignedAt: "2026-06-01T10:00:00.000Z",
    },
    {
        id: "job-002",
        tradeId: "trade-002",
        buyerName: "HP Enrg",
        sellerName: "Graphic Tee",
        pickupLocation: "College Of Science",
        dropoffLocation: "Victory Towers",
        status: "picked_up",
        assignedAt: "2026-06-01T11:00:00.000Z",
    },
];

export default function Dispatch() {
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader title="Rider Portal" showBack={false} />

            <FlatList
                data={MOCK_ONGOING_JOBS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <DispatchCard
                        job={item}
                        onConfirm={() => console.log("confirm pickup", item.id)}
                    />
                )}
                ListHeaderComponent={
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 16,
                            fontWeight: "700",
                            marginBottom: spacing[3],
                            textDecorationLine: "underline",
                        }}
                    >
                        Ongoing
                    </Text>
                }
                ListEmptyComponent={
                    <EmptyState
                        title="No Ongoing Jobs"
                        message="You have no ongoing jobs right now."
                    />
                }
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: spacing[4],
                    paddingBottom: spacing[20],
                }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}