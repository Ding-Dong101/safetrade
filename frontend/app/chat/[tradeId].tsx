import { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { useChat } from "@/hooks/useChat";
import ScreenHeader from "@/components/shared/ScreenHeader";
import { Message } from "@/services/messageService";

export default function ChatScreen() {
    const { tradeId } = useLocalSearchParams<{ tradeId: string }>();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { messages, send, connected, currentUserId } = useChat(tradeId);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        send(input.trim());
        setInput("");
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMine = item.senderId === currentUserId;
        return (
            <View
                style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    backgroundColor: isMine ? colors.primary : colors.card,
                    borderRadius: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginBottom: 8,
                    maxWidth: "80%",
                }}
            >
                <Text style={{ color: isMine ? colors.background : colors.foreground }}>
                    {item.content}
                </Text>
                {isMine && (
                    <Text style={{ fontSize: 10, color: colors.background, opacity: 0.7, marginTop: 2 }}>
                        {item.read ? "Read" : "Sent"}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={insets.top}
        >
            <ScreenHeader title="Chat" />

            {!connected && (
                <Text style={{ textAlign: "center", color: colors.muted, fontSize: 12, paddingVertical: 4 }}>
                    Connecting...
                </Text>
            )}

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={{ padding: spacing[4], flexGrow: 1 }}
            />

            <View
                style={{
                    flexDirection: "row",
                    padding: spacing[3],
                    paddingBottom: insets.bottom + spacing[3],
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    alignItems: "center",
                }}
            >
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.muted}
                    style={{
                        flex: 1,
                        backgroundColor: colors.card,
                        borderRadius: 20,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        color: colors.foreground,
                        marginRight: 8,
                    }}
                    onSubmitEditing={handleSend}
                />
                <TouchableOpacity onPress={handleSend}>
                    <Text style={{ color: colors.primary, fontWeight: "600" }}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}