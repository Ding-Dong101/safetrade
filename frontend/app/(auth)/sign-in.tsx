import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { colors, spacing } from "@/constants/theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";

export default function SignIn() {
    const router = useRouter();
    const { login, isLoading } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Please fill in all fields");
            return;
        }
        setError("");
        const result = await login({ username, password });
        if (!result.success) {
            setError(result.error ?? "Login failed");
        } else {
            router.replace("/(tabs)/home" as any);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                paddingHorizontal: spacing[5],
                paddingVertical: spacing[10],
                backgroundColor: colors.background,
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header & Logo */}
            <View style={{ alignItems: "center", marginBottom: spacing[8] }}>
                <View
                    style={{
                        width: 70,
                        height: 70,
                        borderRadius: 20,
                        backgroundColor: colors.primary + "15",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: spacing[4],
                        borderWidth: 1,
                        borderColor: colors.primary + "30",
                    }}
                >
                    <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
                </View>
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 28,
                        fontWeight: "800",
                        letterSpacing: 0.5,
                    }}
                >
                    SafeTrade
                </Text>
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 14,
                        marginTop: spacing[1],
                        textAlign: "center",
                    }}
                >
                    Secure P2P Escrow Platform
                </Text>
            </View>

            {/* Glassmorphism-style Form Card */}
            <View
                style={{
                    backgroundColor: colors.card,
                    borderRadius: 24,
                    padding: spacing[6],
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: spacing[6],
                }}
            >
                <Input
                    label="Username / Email"
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                
                <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {error ? (
                    <Text
                        style={{
                            color: colors.danger,
                            fontSize: 13,
                            marginBottom: spacing[4],
                            textAlign: "center",
                            fontWeight: "500",
                        }}
                    >
                        {error}
                    </Text>
                ) : null}

                <Button
                    label="Sign In"
                    onPress={handleLogin}
                    isLoading={isLoading}
                    variant="primary"
                    style={{
                        backgroundColor: colors.primary,
                        borderRadius: 12,
                        paddingVertical: 14,
                    }}
                    textStyle={{
                        color: "#000000",
                        fontWeight: "700",
                        fontSize: 16,
                    }}
                />
            </View>

            {/* Footer Links */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: spacing[1.5],
                }}
            >
                <Text style={{ color: colors.muted, fontSize: 14 }}>
                    New to SafeTrade?
                </Text>
                <TouchableOpacity
                    onPress={() => router.push("/(auth)/sign-up" as any)}
                >
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 14,
                            fontWeight: "700",
                        }}
                    >
                        Create an account
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}