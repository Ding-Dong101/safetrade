import { useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { login, isLoading } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

    const handleLogin = async () => {
        const nextErrors: typeof errors = {};
        if (!username.trim()) nextErrors.username = "Username is required";
        if (!password) nextErrors.password = "Password is required";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const result = await login({ username: username.trim(), password });
        if (result.success) {
            Toast.show({
                type: 'success',
                text1: 'Login Successful',
            });
            router.replace("/(buyer)/home");
        } else {
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: result.error,
            });
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.primary }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
                        alignItems: "center",
                        justifyContent: "center",
                        paddingTop: insets.top + spacing[12],
                        paddingBottom: spacing[12],
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2], marginBottom: spacing[2] }}>
                        <Image
                            source={require("@/assets/images/icon.png")}
                            style={{ width: 40, height: 40 }}
                            resizeMode="contain"
                        />
                        <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: "800" }}>
                            SafeTrade
                        </Text>
                    </View>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>Sign in to continue</Text>
                </View>

                <View
                    style={{
                        flex: 1,
                        backgroundColor: colors.background,
                        borderTopLeftRadius: 40,
                        borderTopRightRadius: 40,
                        paddingHorizontal: spacing[6],
                        paddingTop: spacing[10],
                        paddingBottom: insets.bottom + spacing[6],
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 16,
                        elevation: 10,
                    }}
                >
                    <Input
                        label="Username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                        error={errors.username}
                    />
                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        error={errors.password}
                    />

                    <Button
                        label="Log In"
                        onPress={handleLogin}
                        isLoading={isLoading}
                        style={{ marginTop: spacing[2] }}
                    />

                    <View style={{ alignItems: "center", marginTop: spacing[6], gap: spacing[3] }}>
                        <Text style={{ color: colors.muted }}>
                            No Account?{" "}
                        </Text>
                        <TouchableOpacity onPress={() => router.push("/sign-up")}>
                            <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
