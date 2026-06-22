import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { colors, spacing } from "@/constants/theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

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
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                paddingHorizontal: spacing[5],
                backgroundColor: colors.background,
            }}
        >
            {/* Logo */}
            <View style={{ alignItems: "center", marginBottom: spacing[10] }}>
                <Text
                    style={{
                        color: colors.primary,
                        fontSize: 32,
                        fontWeight: "800",
                        letterSpacing: 1,
                    }}
                >
                    SafeTrade
                </Text>
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 14,
                        marginTop: spacing[1],
                    }}
                >
                    Secure P2P Escrow Platform
                </Text>
            </View>

            {/* Form */}
            <View style={{ marginBottom: spacing[4] }}>
                <Input
                    label="Username"
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
                            marginBottom: spacing[3],
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </Text>
                ) : null}

                <Button
                    label="Log In"
                    onPress={handleLogin}
                    isLoading={isLoading}
                />
            </View>

            {/* Footer */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: spacing[1],
                }}
            >
                <Text style={{ color: colors.muted, fontSize: 14 }}>
                    No account?
                </Text>
                <TouchableOpacity
                    onPress={() => router.push("/(auth)/sign-up" as any)}
                >
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 14,
                            fontWeight: "600",
                        }}
                    >
                        Sign Up
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}