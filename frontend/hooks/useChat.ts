import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "@/hooks/useAuth";
import { getMessages, sendMessage as sendMessageRest, Message } from "@/services/messageService";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://safetrade-or1w.onrender.com/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "") + "/ws";

export const useChat = (tradeId: string) => {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [connected, setConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!tradeId) return;

        // Load existing history first (REST), then connect for live updates.
        getMessages(tradeId)
            .then(setMessages)
            .catch((err) => console.error("Failed to load messages:", err));

        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL) as any,
            reconnectDelay: 3000,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/trade/${tradeId}`, (frame) => {
                    const newMessage: Message = JSON.parse(frame.body);
                    setMessages((prev) => [...prev, newMessage]);
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: (frame) => console.error("STOMP error:", frame),
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [tradeId]);

    const send = useCallback(
        (content: string) => {
            if (!content.trim() || !user) return;

            const client = clientRef.current;
            if (client && client.connected) {
                // Live path: broadcast instantly via WebSocket.
                client.publish({
                    destination: `/app/chat/${tradeId}`,
                    body: JSON.stringify({ senderId: user.username, content }),
                });
            } else {
                // Fallback: REST if socket isn't connected yet.
                sendMessageRest(tradeId, content).then((msg) =>
                    setMessages((prev) => [...prev, msg])
                );
            }
        },
        [tradeId, user]
    );

    return { messages, send, connected, currentUserId: user?.username };
};