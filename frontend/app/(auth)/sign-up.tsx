import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { colors, spacing } from "@/constants/theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";

export default function SignUp() {
    const router = useRouter();
    const { register, isLoading } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async () => {
        if (!firstName || !lastName || !username || !email || !password) {
            setError("Please fill in all fields");
            return;
        }
        setError("");
        const result = await register({
            firstName,
            lastName,
            username,
            email,
            password,
        });
        if (!result.success) {
            setError(result.error ?? "Registration failed");
        } else {
            router.replace("/sign-in");
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
            <View style={{ alignItems: "center", marginBottom: spacing[6] }}>
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
                    Create a secure escrow account
                </Text>
            </View>

            {/* Form Card */}
            <View
                style={{
                    backgroundColor: colors.card,
                    borderRadius: 24,
                    padding: spacing[5],
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: spacing[5],
                }}
            >
                <View style={{ flexDirection: "row", gap: spacing[3] }}>
                    <Input
                        label="First Name"
                        placeholder="First name"
                        value={firstName}
                        onChangeText={setFirstName}
                        containerStyle={{ flex: 1 }}
                    />
                    <Input
                        label="Last Name"
                        placeholder="Last name"
                        value={lastName}
                        onChangeText={setLastName}
                        containerStyle={{ flex: 1 }}
                    />
                </View>

                <Input
                    label="Email / Phone Number"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Input
                    label="Username"
                    placeholder="Choose a username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <Input
                    label="Password"
                    placeholder="Choose a password"
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
                            fontWeight: "500",
                        }}
                    >
                        {error}
                    </Text>
                ) : null}

                <Button
                    label="Create Account"
                    onPress={handleRegister}
                    isLoading={isLoading}
                    variant="primary"
                    style={{
                        backgroundColor: colors.primary,
                        borderRadius: 12,
                        paddingVertical: 14,
                        marginTop: spacing[2],
                    }}
                    textStyle={{
                        color: "#000000",
                        fontWeight: "700",
                        fontSize: 16,
                    }}
                />
            </View>

            {/* Footer */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: spacing[1.5],
                }}
            >
                <Text style={{ color: colors.muted, fontSize: 14 }}>
                    Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 14,
                            fontWeight: "700",
                        }}
                    >
                        Sign In
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}