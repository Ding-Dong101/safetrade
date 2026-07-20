import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/shared/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useTrades } from "@/hooks/useTrades";
import { useAuth } from "@/hooks/useAuth";
import { Trade } from "@/types/trade";
import { useEffect, useState } from "react";
import { getUserById } from "@/services/userService";

const TradeChatRow = ({ trade, currentUserId }: { trade: Trade; currentUserId?: string }) => {
    const { colors, spacing } = useTheme();
    const [counterpartyName, setCounterpartyName] = useState<string>("...");

    useEffect(() => {
        const counterpartyId =
            trade.buyerId === currentUserId ? trade.sellerId : trade.buyerId;
        if (!counterpartyId) return;
        getUserById(counterpartyId).then((u) =>
            setCounterpartyName(u?.username ?? counterpartyId)
        );
    }, [trade.buyerId, trade.sellerId, currentUserId]);

    return (
        <Card style={{ marginBottom: spacing[3] }}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/chat/${trade.id}`)}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                    }}
                >
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 15,
                            fontWeight: "600",
                        }}
                    >
                        {counterpartyName}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                        {trade.title}
                    </Text>
                </View>

                <Text
                    style={{ color: colors.muted, fontSize: 13 }}
                    numberOfLines={1}
                >
                    Tap to view conversation about this trade
                </Text>
            </TouchableOpacity>
        </Card>
    );
};

const MessagesScreen = () => {
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { trades } = useTrades();
    const { user } = useAuth();

    return (
        <FlatList
            data={trades}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TradeChatRow trade={item} currentUserId={user?.id} />
            )}
            ListHeaderComponent={
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 22,
                        fontWeight: "700",
                        marginBottom: spacing[4],
                    }}
                >
                    Messages
                </Text>
            }
            ListEmptyComponent={
                <EmptyState
                    title="No Messages"
                    message="Conversations about your trades will show up here."
                />
            }
            contentContainerStyle={{
                paddingHorizontal: spacing[4],
                paddingTop: insets.top + spacing[4],
                paddingBottom: spacing[24],
            }}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: colors.background }}
        />
    );
};

export default MessagesScreen;