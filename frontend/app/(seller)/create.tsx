import { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ShareDealModal from "@/components/trade/ShareDealModal";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useTrades } from "@/hooks/useTrades";
import { createTrade } from "@/services/tradeService";

export default function CreateTrade() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { user } = useAuth();
    const { refetch } = useTrades();

    const [title, setTitle] = useState("");
    const [pickupLocation, setPickupLocation] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [itemPhoto, setItemPhoto] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tradeCode, setTradeCode] = useState<string | null>(null);
    const [riderCode, setRiderCode] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [createdTradeInfo, setCreatedTradeInfo] = useState<{ title: string; price: number } | null>(null);

    const pickImage = async (fromCamera: boolean) => {
        try {
            const permission = fromCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    "Permission Required",
                    `Please grant camera and media library permissions to verify item photos.`
                );
                return;
            }

            const result = fromCamera
                ? await ImagePicker.launchCameraAsync({
                      mediaTypes: ["images"],
                      base64: true,
                      quality: 0.4,
                  })
                : await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ["images"],
                      base64: true,
                      quality: 0.4,
                  });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const base64Data = result.assets[0].base64;
                if (base64Data) {
                    setItemPhoto(base64Data);
                }
            }
        } catch (err: any) {
            Alert.alert("Image Error", err?.message || "Could not select image.");
        }
    };

    const handleCreate = async () => {
        const nextErrors: Record<string, string> = {};
        const parsedPrice = Number(price);
        if (!title.trim()) nextErrors.title = "Item name is required";
        if (!price.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
            nextErrors.price = "Enter a valid price";
        }
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        if (!user?.id) {
            Alert.alert("Not logged in", "Please log in again to create a trade.");
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await createTrade({
                title: title.trim(),
                pickupLocation: pickupLocation.trim() || undefined,
                description: description.trim() || undefined,
                price: parsedPrice,
                sellerId: user.id,
                itemPhotoBase64: itemPhoto ? `data:image/jpeg;base64,${itemPhoto}` : undefined,
            });
            setCreatedTradeInfo({ title: title.trim(), price: parsedPrice });
            await refetch();
            setTradeCode(result.tradeCode);
            setRiderCode(result.riderCode);
        } catch (err: any) {
            Alert.alert(
                "Could not create trade",
                err?.response?.data?.message ?? err?.message ?? "Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setTitle("");
        setPickupLocation("");
        setDescription("");
        setPrice("");
        setItemPhoto(null);
        setTradeCode(null);
        setRiderCode(null);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: insets.top + spacing[4],
                    paddingBottom: spacing[24],
                    gap: spacing[5],
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 22,
                        fontWeight: "700",
                    }}
                >
                    Create Trade
                </Text>

                {tradeCode ? (
                    <Card
                        style={{
                            padding: spacing[6],
                            borderRadius: 20,
                            alignItems: "center",
                            gap: spacing[3],
                        }}
                    >
                        <View
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 32,
                                backgroundColor: colors.primary + "20",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons
                                name="checkmark-circle"
                                size={32}
                                color={colors.primary}
                            />
                        </View>
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 17,
                                fontWeight: "700",
                            }}
                        >
                            Trade Created
                        </Text>
                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 13,
                                textAlign: "center",
                                lineHeight: 20,
                            }}
                        >
                            Share this trade code with your buyer. They can enter it
                            in their Accept Trade tab to join the trade.
                        </Text>
                        <TouchableOpacity
                            onPress={async () => {
                                await Clipboard.setStringAsync(tradeCode ?? "");
                                Alert.alert("Copied", "Trade code copied to clipboard.");
                            }}
                            style={{
                                backgroundColor: colors.cardAlt,
                                borderRadius: 12,
                                paddingVertical: spacing[3],
                                paddingHorizontal: spacing[8],
                                borderWidth: 1,
                                borderColor: colors.primary,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.primary,
                                    fontSize: 24,
                                    fontWeight: "800",
                                    letterSpacing: 6,
                                    textAlign: "center",
                                }}
                            >
                                {tradeCode}
                            </Text>
                            <Text
                                style={{
                                    color: colors.muted,
                                    fontSize: 11,
                                    textAlign: "center",
                                    marginTop: 4,
                                }}
                            >
                                Tap to copy
                            </Text>
                        </TouchableOpacity>

                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 13,
                                textAlign: "center",
                                marginTop: spacing[3],
                            }}
                        >
                            Share this code with your rider for delivery pickup.
                        </Text>
                        <TouchableOpacity
                            onPress={async () => {
                                await Clipboard.setStringAsync(riderCode ?? "");
                                Alert.alert("Copied", "Rider code copied to clipboard.");
                            }}
                            style={{
                                backgroundColor: colors.cardAlt,
                                borderRadius: 12,
                                paddingVertical: spacing[3],
                                paddingHorizontal: spacing[8],
                                borderWidth: 1,
                                borderColor: colors.muted,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.foreground,
                                    fontSize: 24,
                                    fontWeight: "800",
                                    letterSpacing: 6,
                                    textAlign: "center",
                                }}
                            >
                                {riderCode}
                            </Text>
                            <Text
                                style={{
                                    color: colors.muted,
                                    fontSize: 11,
                                    textAlign: "center",
                                    marginTop: 4,
                                }}
                            >
                                Tap to copy
                            </Text>
                        </TouchableOpacity>

                        {/* WhatsApp / Social Share Deal Button */}
                        <TouchableOpacity
                            onPress={() => setIsShareModalOpen(true)}
                            activeOpacity={0.8}
                            style={{
                                backgroundColor: "#25D366",
                                borderRadius: 14,
                                paddingVertical: spacing[3] + 2,
                                paddingHorizontal: spacing[4],
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                marginTop: spacing[2],
                                shadowColor: "#25D366",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "800" }}>
                                Share Deal on WhatsApp / Social
                            </Text>
                        </TouchableOpacity>

                        <View
                            style={{
                                flexDirection: "row",
                                gap: spacing[3],
                                marginTop: spacing[2],
                            }}
                        >
                            <Button
                                label="New Trade"
                                variant="outlined"
                                onPress={handleReset}
                                style={{ flex: 1 }}
                            />
                            <Button
                                label="View Trades"
                                onPress={() => router.push("/(seller)/home")}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </Card>
                ) : (
                    <Card style={{ padding: spacing[6], borderRadius: 20 }}>
                        <Input
                            label="Item Name"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. HP Envy"
                            error={errors.title}
                        />
                        <Input
                            label="Pickup Location"
                            value={pickupLocation}
                            onChangeText={setPickupLocation}
                            placeholder="e.g. Hall 7, Room 204"
                        />
                        <Input
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe the item and condition"
                            multiline
                            numberOfLines={3}
                            style={{ minHeight: 80, textAlignVertical: "top" }}
                        />
                        <Input
                            label="Price (GHS)"
                            value={price}
                            onChangeText={setPrice}
                            placeholder="750.00"
                            keyboardType="decimal-pad"
                            error={errors.price}
                        />

                        {/* Item Photo Verification */}
                        <View style={{ marginTop: spacing[3], marginBottom: spacing[2] }}>
                            <Text
                                style={{
                                    color: colors.foreground,
                                    fontSize: 14,
                                    fontWeight: "600",
                                    marginBottom: spacing[2],
                                }}
                            >
                                Item Photo Verification (Optional)
                            </Text>

                            {itemPhoto ? (
                                <View
                                    style={{
                                        position: "relative",
                                        borderRadius: 14,
                                        overflow: "hidden",
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }}
                                >
                                    <Image
                                        source={{ uri: `data:image/jpeg;base64,${itemPhoto}` }}
                                        style={{ width: "100%", height: 160 }}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setItemPhoto(null)}
                                        style={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            backgroundColor: "rgba(0,0,0,0.65)",
                                            borderRadius: 16,
                                            padding: 6,
                                        }}
                                    >
                                        <Ionicons name="close" size={16} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: spacing[3],
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => pickImage(true)}
                                        style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 8,
                                            paddingVertical: spacing[3],
                                            backgroundColor: colors.cardAlt,
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <Ionicons name="camera-outline" size={18} color={colors.primary} />
                                        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>
                                            Take Photo
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => pickImage(false)}
                                        style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 8,
                                            paddingVertical: spacing[3],
                                            backgroundColor: colors.cardAlt,
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <Ionicons name="images-outline" size={18} color={colors.primary} />
                                        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>
                                            Gallery
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <Button
                            label="Create Trade"
                            onPress={handleCreate}
                            isLoading={isSubmitting}
                            style={{ marginTop: spacing[3] }}
                        />
                    </Card>
                )}
            </ScrollView>

            <ShareDealModal
                visible={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title={createdTradeInfo?.title || title}
                price={createdTradeInfo?.price || Number(price) || 0}
                tradeCode={tradeCode ?? ""}
            />
        </KeyboardAvoidingView>
    );
}