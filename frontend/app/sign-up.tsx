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

export default function SignUp() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { register, isLoading } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSignUp = async () => {
        const nextErrors: Record<string, string> = {};
        if (!firstName.trim()) nextErrors.firstName = "Required";
        if (!lastName.trim()) nextErrors.lastName = "Required";
        if (!emailOrPhone.trim()) nextErrors.emailOrPhone = "Email or phone is required";
        if (!username.trim()) nextErrors.username = "Username is required";
        if (password.length < 6) nextErrors.password = "At least 6 characters";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const isEmail = emailOrPhone.includes("@");
        const result = await register({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            username: username.trim(),
            email: isEmail ? emailOrPhone.trim() : "",
            phone: isEmail ? undefined : emailOrPhone.trim(),
            password,
        });

        if (result.success) {
            Alert.alert("Account Created", "You can now log in with your details.", [
                { text: "OK", onPress: () => router.replace("/login") },
            ]);
        } else {
            Alert.alert("Sign Up Failed", result.error);
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
                        marginBottom: spacing[8],
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
                    <View style={{ flexDirection: "row", gap: spacing[3] }}>
                        <Input
                            label="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                            containerStyle={{ flex: 1 }}
                            error={errors.firstName}
                        />
                        <Input
                            label="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                            containerStyle={{ flex: 1 }}
                            error={errors.lastName}
                        />
                    </View>

                    <Input
                        label="Email / Phone Number"
                        value={emailOrPhone}
                        onChangeText={setEmailOrPhone}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        error={errors.emailOrPhone}
                    />
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
                        label="Create Account"
                        onPress={handleSignUp}
                        isLoading={isLoading}
                        style={{ marginTop: spacing[2] }}
                    />

                    <View style={{ alignItems: "center", marginTop: spacing[5] }}>
                        <Text style={{ color: colors.muted, fontSize: 13 }}>
                            Already have an account?{" "}
                            <Text
                                style={{ color: colors.primary, fontWeight: "700" }}
                                onPress={() => router.replace("/login")}
                            >
                                Log In
                            </Text>
                        </Text>
                    </View>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
