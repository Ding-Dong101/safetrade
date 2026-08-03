import { useState, useEffect } from "react";
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert, Platform, Modal, TextInput, KeyboardAvoidingView, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { updateBankDetails, verifyAccount } from "@/services/authService";
import Toast from "react-native-toast-message";

interface SettingRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
    isLast?: boolean;
}

const SettingRow = ({ icon, label, onPress, rightElement, danger, isLast }: SettingRowProps) => {
    const { colors, spacing } = useTheme();
    const color = danger ? "#ffffff" : colors.foreground;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.8}
            style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: spacing[4],
                paddingHorizontal: spacing[5],
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: colors.border,
                gap: spacing[3],
            }}
        >
            <Ionicons name={icon} size={20} color={danger ? "#ffffff" : colors.muted} />
            <Text style={{ flex: 1, color, fontSize: 15, fontWeight: danger ? "700" : "500" }}>
                {label}
            </Text>
            {rightElement ??
                (onPress && !danger ? (
                    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                ) : null)}
        </TouchableOpacity>
    );
};

const SettingsScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing, isDark, toggleTheme } = useTheme();
    const { user, token, logout, setUser, updateUser } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username;

    const [isBankModalVisible, setBankModalVisible] = useState(false);
    const [sellerName, setSellerName] = useState(user?.paymentName || "");
    const [phoneNumber, setPhoneNumber] = useState(user?.paymentNumber || "");
    const [network, setNetwork] = useState(user?.paymentNetwork || "MTN"); // MTN or VOD (Telecel)
    const [isSavingBank, setIsSavingBank] = useState(false);

    // Identity Verification state
    const [isVerifyModalVisible, setVerifyModalVisible] = useState(false);
    const [idType, setIdType] = useState(user?.idType || "GHANA_CARD");
    const [idNumber, setIdNumber] = useState(user?.idNumber || "");
    const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

    useEffect(() => {
        setSellerName(user?.paymentName || "");
        setPhoneNumber(user?.paymentNumber || "");
        setNetwork(user?.paymentNetwork || "MTN");
        setIdType(user?.idType || "GHANA_CARD");
        setIdNumber(user?.idNumber || "");
    }, [user]);

    const handleVerifyIdentity = async () => {
        if (!idNumber.trim()) {
            Alert.alert("Required", "Please enter your ID number.");
            return;
        }
        setIsSubmittingVerify(true);
        try {
            const response = await verifyAccount({
                idType,
                idNumber: idNumber.trim(),
            });
            if (response.user) {
                updateUser(response.user);
            }
            Toast.show({ type: "success", text1: "Identity Verified!", text2: "Your account is now verified." });
            setVerifyModalVisible(false);
        } catch (error: any) {
            Alert.alert("Verification Error", error?.response?.data?.error || error.message || "Failed to verify identity");
        } finally {
            setIsSubmittingVerify(false);
        }
    };

    const handleSaveBankDetails = async () => {
        if (!sellerName || !phoneNumber) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setIsSavingBank(true);
        try {
            const response = await updateBankDetails({
                name: sellerName,
                accountNumber: phoneNumber,
                bankCode: network,
            });
            if (token && response.user) {
                setUser(response.user, token);
            }
            Toast.show({ type: "success", text1: "Payment details saved!" });
            setBankModalVisible(false);
        } catch (error: any) {
            console.error("Save Bank Details Error:", error.response?.data || error);
            Alert.alert("Error", error.message || "Failed to save payment details");
        } finally {
            setIsSavingBank(false);
        }
    };

    const handlePickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(
                "Permission needed",
                "Allow photo library access to set a profile picture."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]?.uri && user && token) {
            setUser({ ...user, avatar: result.assets[0].uri }, token);
        }
    };

    const handleLogout = async () => {
        if (Platform.OS === "web") {
            const confirmed = window.confirm("Are you sure you want to log out?");
            if (confirmed) {
                await logout();
                router.replace("/login");
            }
        } else {
            Alert.alert("Log Out", "Are you sure you want to log out?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace("/login");
                    },
                },
            ]);
        }
    };

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{
                paddingHorizontal: spacing[4],
                paddingTop: insets.top + spacing[4],
                paddingBottom: spacing[24],
                gap: spacing[4],
            }}
            showsVerticalScrollIndicator={false}
        >
            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 22,
                    fontWeight: "700",
                }}
            >
                Settings
            </Text>

            <Card>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing[4],
                    }}
                >
                    <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8}>
                        <Avatar
                            name={fullName}
                            source={user?.avatar ? { uri: user.avatar } : undefined}
                            size={72}
                        />
                        <View
                            style={{
                                position: "absolute",
                                bottom: -2,
                                right: -2,
                                backgroundColor: colors.primary,
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                alignItems: "center",
                                justifyContent: "center",
                                borderWidth: 2,
                                borderColor: colors.card,
                            }}
                        >
                            <Ionicons name="camera" size={14} color={colors.background} />
                        </View>
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Text
                                style={{
                                    color: colors.foreground,
                                    fontSize: 17,
                                    fontWeight: "700",
                                }}
                                numberOfLines={1}
                            >
                                {fullName ?? "Guest"}
                            </Text>
                            {user?.isVerified ? (
                                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.success}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, gap: 3 }}>
                                    <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                                    <Text style={{ color: colors.success, fontSize: 10, fontWeight: "700" }}>Verified</Text>
                                </View>
                            ) : null}
                        </View>
                        {user?.email ? (
                            <Text
                                style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}
                                numberOfLines={1}
                            >
                                {user.email}
                            </Text>
                        ) : null}
                        <Text
                            style={{
                                color: colors.primary,
                                fontSize: 12,
                                fontWeight: "600",
                                marginTop: 4,
                            }}
                            onPress={handlePickAvatar}
                        >
                            Change profile photo
                        </Text>
                    </View>
                </View>
            </Card>

            <Card style={{ paddingVertical: 0 }}>
                <SettingRow
                    icon={isDark ? "moon" : "sunny"}
                    label="Light Theme"
                    rightElement={
                        <Switch
                            value={!isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.cardAlt, true: colors.primary }}
                            thumbColor="#ffffff"
                        />
                    }
                />
                <SettingRow
                    icon="notifications-outline"
                    label="Notifications"
                    rightElement={
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: colors.cardAlt, true: colors.primary }}
                            thumbColor="#ffffff"
                        />
                    }
                />
                <SettingRow
                    icon="shield-checkmark-outline"
                    label={user?.isVerified ? "Account Verified (Ghana Card / ID)" : "Verify Identity & Account"}
                    onPress={() => setVerifyModalVisible(true)}
                    rightElement={
                        user?.isVerified ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                <Text style={{ color: colors.success, fontSize: 12, fontWeight: "700" }}>Active</Text>
                            </View>
                        ) : (
                            <View style={{ backgroundColor: `${colors.info}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                                <Text style={{ color: colors.info, fontSize: 11, fontWeight: "700" }}>Verify</Text>
                            </View>
                        )
                    }
                />
                <SettingRow
                    icon="card-outline"
                    label="Payment Details (Mobile Money)"
                    onPress={() => setBankModalVisible(true)}
                />
                <SettingRow
                    icon="lock-closed-outline"
                    label="Privacy and Security"
                    onPress={() =>
                        Alert.alert(
                            "Privacy and Security",
                            "Manage your password, two-factor authentication and data preferences here soon."
                        )
                    }
                    isLast
                />
            </Card>

            <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.8}
                style={{
                    backgroundColor: colors.danger,
                    borderRadius: 24,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.08,
                    shadowRadius: 24,
                    elevation: 8,
                }}
            >
                <SettingRow
                    icon="log-out-outline"
                    label="Log Out"
                    onPress={handleLogout}
                    danger
                    isLast
                />
            </TouchableOpacity>

            <View style={{ alignItems: "center", marginTop: spacing[2] }}>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                    SafeTrade v1.0.0
                </Text>
            </View>

            {/* Account Verification Modal */}
            <Modal
                visible={isVerifyModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setVerifyModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
                >
                    <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing[6], maxHeight: "85%" }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[4] }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                                <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700" }}>Account Verification</Text>
                            </View>
                            <TouchableOpacity onPress={() => setVerifyModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.muted} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: colors.muted, marginBottom: 16, fontSize: 13, lineHeight: 18 }}>
                            Verify your identity to increase trade security and unlock higher escrow transaction limits.
                        </Text>

                        <Text style={{ color: colors.muted, marginBottom: 8, fontSize: 14, fontWeight: "600" }}>Select ID Document</Text>
                        <View style={{ flexDirection: "row", gap: 8, marginBottom: spacing[4] }}>
                            {[
                                { key: "GHANA_CARD", label: "Ghana Card" },
                                { key: "PASSPORT", label: "Passport" },
                                { key: "VOTER_ID", label: "Voter ID" },
                            ].map((doc) => (
                                <TouchableOpacity
                                    key={doc.key}
                                    onPress={() => setIdType(doc.key)}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: idType === doc.key ? colors.primary : colors.border,
                                        backgroundColor: idType === doc.key ? `${colors.primary}15` : colors.card,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ color: idType === doc.key ? colors.primary : colors.foreground, fontSize: 12, fontWeight: "700" }}>
                                        {doc.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={{ color: colors.muted, marginBottom: 8, fontSize: 14, fontWeight: "600" }}>ID Document Number</Text>
                        <TextInput
                            value={idNumber}
                            onChangeText={setIdNumber}
                            placeholder={idType === "GHANA_CARD" ? "GHA-123456789-0" : "Enter document ID"}
                            placeholderTextColor={colors.muted}
                            autoCapitalize="characters"
                            style={{
                                backgroundColor: colors.card,
                                color: colors.foreground,
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: spacing[6],
                                borderWidth: 1,
                                borderColor: colors.border,
                                fontSize: 15,
                            }}
                        />

                        <TouchableOpacity 
                            onPress={handleVerifyIdentity} 
                            disabled={isSubmittingVerify}
                            style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: "center" }}
                        >
                            {isSubmittingVerify ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={{ color: colors.background, fontWeight: "700", fontSize: 16 }}>
                                    {user?.isVerified ? "Update Verification" : "Submit Verification"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Mobile Money Payment Modal */}
            <Modal
                visible={isBankModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setBankModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View style={{ backgroundColor: colors.background, padding: spacing[6], borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[6] }}>
                            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "700" }}>Payment Details</Text>
                            <TouchableOpacity onPress={() => setBankModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.foreground} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: colors.muted, marginBottom: 8, fontSize: 14 }}>Select Network</Text>
                        <View style={{ flexDirection: "row", gap: spacing[2], marginBottom: spacing[4] }}>
                            <TouchableOpacity
                                onPress={() => setNetwork("MTN")}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: network === "MTN" ? colors.primary : colors.border,
                                    backgroundColor: network === "MTN" ? `${colors.primary}15` : colors.card,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Image
                                    source={require("@/assets/images/mtn_logo.png")}
                                    style={{ width: 64, height: 40 }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setNetwork("VOD")}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: network === "VOD" ? colors.primary : colors.border,
                                    backgroundColor: network === "VOD" ? `${colors.primary}15` : colors.card,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Image
                                    source={require("@/assets/images/telecel_logo.png")}
                                    style={{ width: 64, height: 40 }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setNetwork("ATL")}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: network === "ATL" ? colors.primary : colors.border,
                                    backgroundColor: network === "ATL" ? `${colors.primary}15` : colors.card,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Image
                                    source={require("@/assets/images/airteltigo_logo.png")}
                                    style={{ width: 64, height: 40 }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: colors.muted, marginBottom: 8, fontSize: 14 }}>Name of Seller</Text>
                        <TextInput
                            value={sellerName}
                            onChangeText={setSellerName}
                            placeholder="e.g. John Doe"
                            placeholderTextColor={colors.muted}
                            style={{ backgroundColor: colors.card, color: colors.foreground, padding: 16, borderRadius: 12, marginBottom: spacing[4], borderWidth: 1, borderColor: colors.border }}
                        />

                        <Text style={{ color: colors.muted, marginBottom: 8, fontSize: 14 }}>Phone Number</Text>
                        <TextInput
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="e.g. 0541234567"
                            keyboardType="numeric"
                            placeholderTextColor={colors.muted}
                            style={{ backgroundColor: colors.card, color: colors.foreground, padding: 16, borderRadius: 12, marginBottom: spacing[6], borderWidth: 1, borderColor: colors.border }}
                        />

                        <TouchableOpacity 
                            onPress={handleSaveBankDetails} 
                            disabled={isSavingBank}
                            style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: "center" }}
                        >
                            {isSavingBank ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={{ color: colors.background, fontWeight: "700", fontSize: 16 }}>Save Payment Details</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScrollView>
    );
};

export default SettingsScreen;
