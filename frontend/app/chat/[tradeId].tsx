import { useState, useRef, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { useChat } from "@/hooks/useChat";
import ScreenHeader from "@/components/shared/ScreenHeader";
import { Message } from "@/services/messageService";
import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen() {
    const { tradeId } = useLocalSearchParams<{ tradeId: string }>();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { messages, send, connected, currentUserId } = useChat(tradeId);
    const [input, setInput] = useState("");
    const flatListRef = useRef<FlatList<Message>>(null);

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages.length]);

    const handleSend = () => {
        if (!input.trim()) return;
        send(input.trim());
        setInput("");
    };

    const formatTime = (timestamp?: string) => {
        if (!timestamp) return "";
        try {
            const d = new Date(timestamp);
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "";
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMine = item.senderId === currentUserId;
        const timeStr = formatTime(item.sentAt);

        return (
            <View
                style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    backgroundColor: isMine ? colors.primary : colors.card,
                    borderRadius: 18,
                    borderBottomRightRadius: isMine ? 4 : 18,
                    borderBottomLeftRadius: !isMine ? 4 : 18,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    marginBottom: 8,
                    maxWidth: "80%",
                    borderWidth: 1,
                    borderColor: isMine ? "transparent" : colors.border,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                }}
            >
                <Text
                    style={{
                        color: isMine ? "#ffffff" : colors.foreground,
                        fontSize: 15,
                        lineHeight: 20,
                    }}
                >
                    {item.content}
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        marginTop: 4,
                        gap: 4,
                    }}
                >
                    {timeStr ? (
                        <Text
                            style={{
                                fontSize: 10,
                                color: isMine ? "rgba(255,255,255,0.7)" : colors.muted,
                            }}
                        >
                            {timeStr}
                        </Text>
                    ) : null}
                    {isMine && (
                        <Ionicons
                            name={item.read ? "checkmark-done" : "checkmark"}
                            size={14}
                            color={item.read ? "#60a5fa" : "rgba(255,255,255,0.7)"}
                        />
                    )}
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={insets.top}
        >
            <ScreenHeader
                title="Trade Chat"
                rightElement={
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <View
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: connected ? colors.success : colors.muted,
                            }}
                        />
                        <Text style={{ fontSize: 11, color: colors.muted }}>
                            {connected ? "Live" : "Connecting"}
                        </Text>
                    </View>
                }
            />

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={{ padding: spacing[4], flexGrow: 1 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View
                style={{
                    flexDirection: "row",
                    padding: spacing[3],
                    paddingBottom: insets.bottom + spacing[3],
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    backgroundColor: colors.card,
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.muted}
                    style={{
                        flex: 1,
                        backgroundColor: colors.background,
                        borderRadius: 22,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        color: colors.foreground,
                        fontSize: 14,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                    onSubmitEditing={handleSend}
                />
                <TouchableOpacity
                    onPress={handleSend}
                    activeOpacity={0.8}
                    disabled={!input.trim()}
                    style={{
                        backgroundColor: input.trim() ? colors.primary : `${colors.primary}50`,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Ionicons name="send" size={18} color="#ffffff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}