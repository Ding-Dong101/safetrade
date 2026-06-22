import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { colors, spacing } from "@/constants/theme";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

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
        >
            {/* Logo */}
            <View style={{ alignItems: "center", marginBottom: spacing[8] }}>
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
                    Create your account
                </Text>
            </View>

            {/* Form */}
            <View style={{ marginBottom: spacing[4] }}>
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
                        }}
                    >
                        {error}
                    </Text>
                ) : null}

                <Button
                    label="Create Account"
                    onPress={handleRegister}
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
                    Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 14,
                            fontWeight: "600",
                        }}
                    >
                        Sign In
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}