
import { View, Text, FlatList } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "@/components/shared/EmptyState";

const MOCK_NOTIFICATIONS = [
    {
        id: "1",
        title: "Trade Funded",
        message: "Your trade of GH₵750.00 has been funded by the buyer.",
        time: "2 hours ago",
        read: false,
    },
    {
        id: "2",
        title: "Rider Assigned",
        message: "A rider has been assigned to your trade.",
        time: "5 hours ago",
        read: false,
    },
    {
        id: "3",
        title: "Trade Completed",
        message: "Your trade of GH₵350.00 has been completed successfully.",
        time: "1 day ago",
        read: true,
    },
];

export default function Notifications() {
    const insets = useSafeAreaInsets();

    const renderItem = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => (
        <View
            style={{
                backgroundColor: item.read ? colors.card : colors.card,
                borderRadius: 12,
                padding: spacing[4],
                marginBottom: spacing[3],
                borderWidth: 1,
                borderColor: item.read ? colors.border : colors.primary + "40",
                borderLeftWidth: item.read ? 1 : 3,
                borderLeftColor: item.read ? colors.border : colors.primary,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing[1],
                }}
            >
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 15,
                        fontWeight: "600",
                    }}
                >
                    {item.title}
                </Text>
                {!item.read && (
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: colors.primary,
                        }}
                    />
                )}
            </View>

            <Text
                style={{
                    color: colors.muted,
                    fontSize: 13,
                    marginBottom: spacing[2],
                    lineHeight: 20,
                }}
            >
                {item.message}
            </Text>

            <Text
                style={{
                    color: colors.mutedForeground,
                    fontSize: 11,
                }}
            >
                {item.time}
            </Text>
        </View>
    );

    return (
        <FlatList
            data={MOCK_NOTIFICATIONS}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 22,
                        fontWeight: "700",
                        marginBottom: spacing[4],
                    }}
                >
                    Notifications
                </Text>
            }
            ListEmptyComponent={
                <EmptyState
                    title="No Notifications"
                    message="You have no notifications yet."
                />
            }
            contentContainerStyle={{
                paddingHorizontal: spacing[4],
                paddingTop: insets.top + spacing[4],
                paddingBottom: spacing[20],
            }}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: colors.background }}
        />
    );
}