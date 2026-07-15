import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/shared/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { MOCK_CHATS, ChatPreview } from "@/constants/data";

const ChatRow = ({ chat }: { chat: ChatPreview }) => {
    const { colors, spacing } = useTheme();

    return (
        <Card style={{ marginBottom: spacing[3] }}>
            <TouchableOpacity activeOpacity={0.7}>
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
                        {chat.name}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                        {chat.time}
                    </Text>
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Text
                        style={{ color: colors.muted, fontSize: 13, flex: 1 }}
                        numberOfLines={1}
                    >
                        {chat.lastMessage}
                    </Text>
                    {chat.unread > 0 && (
                        <View
                            style={{
                                backgroundColor: colors.primary,
                                borderRadius: 10,
                                minWidth: 20,
                                height: 20,
                                alignItems: "center",
                                justifyContent: "center",
                                marginLeft: 8,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.background,
                                    fontSize: 11,
                                    fontWeight: "700",
                                }}
                            >
                                {chat.unread}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Card>
    );
};

const MessagesScreen = () => {
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();

    return (
        <FlatList
            data={MOCK_CHATS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatRow chat={item} />}
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
