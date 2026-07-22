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
            Toast.show({
                type: 'success',
                text1: 'Account Created',
                text2: 'You can now log in with your details.',
                onHide: () => router.replace("/login")
            });
        } else {
            Toast.show({
                type: 'error',
                text1: 'Sign Up Failed',
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
                            source={require("@/assets/icons/logo.png")}
                            style={{ width: 44, height: 44, tintColor: "#fff" }}
                            resizeMode="contain"
                        />
                        <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: "800" }}>
                            SafeTrade
                        </Text>
                    </View>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>Create an account</Text>
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

                    <View style={{ alignItems: "center", marginTop: spacing[5], gap: spacing[3] }}>
                        <Text style={{ color: colors.muted }}>
                            Already have an account?{" "}
                        </Text>
                        <TouchableOpacity onPress={() => router.replace("/login")}>
                            <Text style={{ color: colors.primary, fontWeight: "700" }}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
