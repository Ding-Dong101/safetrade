import { useRef, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Modal,
    Animated,
    TextInput,
    ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { sendSignupOtp, verifySignupOtp } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";

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

    // OTP flow state
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.88)).current;

    const showModal = () => {
        setOtpModalVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 7, useNativeDriver: true }),
        ]).start();
    };

    const hideModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.88, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            setOtpModalVisible(false);
            setOtpValue("");
            setOtpError("");
        });
    };

    const startCooldown = () => {
        setResendCooldown(60);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    if (cooldownRef.current) clearInterval(cooldownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

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
        if (!isEmail) {
            // Phone-only accounts skip OTP and go straight to registration
            await doRegister();
            return;
        }

        // Email provided — send OTP first
        try {
            setIsSendingOtp(true);
            await sendSignupOtp(emailOrPhone.trim().toLowerCase());
            startCooldown();
            showModal();
        } catch (err: any) {
            const msg =
                typeof err?.response?.data?.error === "string"
                    ? err.response.data.error
                    : err?.message ?? "Failed to send verification code. Please try again.";
            Toast.show({ type: "error", text1: "Couldn't Send Code", text2: msg });
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        try {
            setIsSendingOtp(true);
            setOtpError("");
            await sendSignupOtp(emailOrPhone.trim().toLowerCase());
            startCooldown();
            Toast.show({ type: "success", text1: "Code Resent", text2: "A new code was sent to your email." });
        } catch (err: any) {
            setOtpError("Failed to resend code. Please try again.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otpValue.trim().length !== 6) {
            setOtpError("Please enter the 6-digit code.");
            return;
        }
        try {
            setIsVerifyingOtp(true);
            setOtpError("");
            await verifySignupOtp(emailOrPhone.trim().toLowerCase(), otpValue.trim());
            hideModal();
            await doRegister();
        } catch (err: any) {
            const msg =
                typeof err?.response?.data?.error === "string"
                    ? err.response.data.error
                    : err?.message ?? "Invalid or expired code. Please try again.";
            setOtpError(msg);
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const doRegister = async () => {
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
                type: "success",
                text1: "Account Created",
                text2: "You can now log in with your details.",
                onHide: () => router.replace("/login"),
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Sign Up Failed",
                text2: result.error,
            });
        }
    };

    return (
        <>
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
                                source={require("@/assets/icon.png")}
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
                                placeholder="e.g. John"
                                containerStyle={{ flex: 1 }}
                                error={errors.firstName}
                            />
                            <Input
                                label="Last Name"
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="e.g. Doe"
                                containerStyle={{ flex: 1 }}
                                error={errors.lastName}
                            />
                        </View>

                        <Input
                            label="Email / Phone Number"
                            value={emailOrPhone}
                            onChangeText={setEmailOrPhone}
                            placeholder="e.g. john@email.com or 0241234567"
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            error={errors.emailOrPhone}
                        />
                        <Input
                            label="Username"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Choose a username"
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={errors.username}
                        />
                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="At least 6 characters"
                            secureTextEntry
                            error={errors.password}
                        />

                        <Button
                            label="Create Account"
                            onPress={handleSignUp}
                            isLoading={isLoading || isSendingOtp}
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

            {/* OTP Verification Modal */}
            <Modal
                visible={otpModalVisible}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={hideModal}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.55)",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: spacing[5],
                    }}
                >
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                            backgroundColor: colors.background,
                            borderRadius: 28,
                            width: "100%",
                            padding: spacing[7],
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 16 },
                            shadowOpacity: 0.18,
                            shadowRadius: 32,
                            elevation: 20,
                        }}
                    >
                        {/* Header */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[5] }}>
                            <View style={{ flex: 1 }}>
                                <View
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 16,
                                        backgroundColor: `${colors.primary}18`,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: spacing[3],
                                    }}
                                >
                                    <Ionicons name="mail-outline" size={24} color={colors.primary} />
                                </View>
                                <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginBottom: 4 }}>
                                    Verify Your Email
                                </Text>
                                <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
                                    We sent a 6-digit code to{"\n"}
                                    <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                                        {emailOrPhone}
                                    </Text>
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={hideModal}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: colors.cardAlt,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Ionicons name="close" size={18} color={colors.muted} />
                            </TouchableOpacity>
                        </View>

                        {/* OTP Input */}
                        <TextInput
                            value={otpValue}
                            onChangeText={(v) => {
                                setOtpValue(v.replace(/[^0-9]/g, "").slice(0, 6));
                                setOtpError("");
                            }}
                            placeholder="Enter 6-digit code"
                            placeholderTextColor={colors.muted}
                            keyboardType="number-pad"
                            maxLength={6}
                            style={{
                                backgroundColor: colors.card,
                                borderRadius: 14,
                                borderWidth: 1.5,
                                borderColor: otpError ? colors.danger : colors.border,
                                paddingHorizontal: spacing[4],
                                paddingVertical: spacing[4],
                                fontSize: 26,
                                fontWeight: "700",
                                letterSpacing: 10,
                                textAlign: "center",
                                color: colors.foreground,
                                marginBottom: spacing[2],
                            }}
                        />

                        {!!otpError && (
                            <Text style={{ color: colors.danger, fontSize: 12, marginBottom: spacing[3], textAlign: "center" }}>
                                {otpError}
                            </Text>
                        )}

                        {/* Verify Button */}
                        <TouchableOpacity
                            onPress={handleVerifyOtp}
                            disabled={isVerifyingOtp}
                            activeOpacity={0.85}
                            style={{
                                backgroundColor: colors.primary,
                                borderRadius: 14,
                                paddingVertical: 15,
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: spacing[2],
                                marginBottom: spacing[4],
                            }}
                        >
                            {isVerifyingOtp ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                                    Verify & Create Account
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Resend */}
                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4 }}>
                            <Text style={{ color: colors.muted, fontSize: 13 }}>Didn't receive it?</Text>
                            <TouchableOpacity onPress={handleResendOtp} disabled={resendCooldown > 0 || isSendingOtp}>
                                <Text
                                    style={{
                                        color: resendCooldown > 0 ? colors.muted : colors.primary,
                                        fontWeight: "700",
                                        fontSize: 13,
                                    }}
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : isSendingOtp ? "Sending..." : "Resend Code"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}
