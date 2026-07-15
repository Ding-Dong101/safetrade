import { useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/ui/Card";
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
            router.replace("/(buyer)/home");
        } else {
            Alert.alert("Login Failed", result.error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                    paddingHorizontal: spacing[5],
                    paddingTop: insets.top + spacing[6],
                    paddingBottom: insets.bottom + spacing[6],
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: spacing[2],
                        marginBottom: spacing[10],
                    }}
                >
                    <Image
                        source={require("@/assets/icons/logo.png")}
                        style={{ width: 44, height: 44 }}
                        resizeMode="contain"
                    />
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 30,
                            fontWeight: "800",
                        }}
                    >
                        SafeTrade
                    </Text>
                </View>

                <Card style={{ padding: spacing[6], borderRadius: 20 }}>
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

                    <View
                        style={{
                            alignItems: "center",
                            marginTop: spacing[6],
                            gap: spacing[3],
                        }}
                    >
                        <View
                            style={{
                                width: "60%",
                                height: 1,
                                backgroundColor: colors.border,
                            }}
                        />
                        <Text style={{ color: colors.muted, fontSize: 13 }}>
                            No Account?
                        </Text>
                        <Button
                            label="Sign Up"
                            variant="outlined"
                            onPress={() => router.push("/sign-up")}
                            style={{ alignSelf: "stretch" }}
                        />
                    </View>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
