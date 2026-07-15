import { useMemo, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PortalSwitcher from "@/components/home/PortalSwitcher";
import EmptyState from "@/components/shared/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { MOCK_PARCELS, PostParcel } from "@/constants/data";

interface ParcelCardProps {
    parcel: PostParcel;
    onVerified: (parcelId: string) => void;
}

const ParcelCard = ({ parcel, onVerified }: ParcelCardProps) => {
    const { colors, spacing } = useTheme();
    const [code, setCode] = useState("");

    const isDropOff = parcel.status === "pending_drop_off";
    const accent = isDropOff ? colors.accent : colors.primary;
    const codeLabel = isDropOff ? "Drop-Off Code" : "Pick-Up Code";
    const statusLabel = isDropOff ? "Pending Drop-Off" : "Awaiting Buyer Collection";

    const handleVerify = () => {
        if (code.trim().length < 4) {
            Alert.alert("Invalid Code", `Enter the ${codeLabel.toLowerCase()} to verify.`);
            return;
        }
        Alert.alert(
            "Code Verified",
            isDropOff
                ? `"${parcel.itemName}" has been received at the post.`
                : `"${parcel.itemName}" has been released to the buyer.`,
            [{ text: "OK", onPress: () => onVerified(parcel.id) }]
        );
    };

    return (
        <Card style={{ marginBottom: spacing[3] }}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 15,
                            fontWeight: "600",
                            marginBottom: 4,
                        }}
                    >
                        {parcel.itemName}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                        ID: {parcel.tradeId}
                    </Text>
                </View>

                <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <TextInput
                        value={code}
                        onChangeText={(value) => setCode(value.toUpperCase())}
                        placeholder={codeLabel}
                        placeholderTextColor={accent}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        onSubmitEditing={handleVerify}
                        style={{
                            borderWidth: 1.5,
                            borderColor: accent,
                            borderRadius: 8,
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            color: colors.foreground,
                            fontSize: 13,
                            fontWeight: "600",
                            minWidth: 140,
                            textAlign: "center",
                        }}
                    />
                    <Text
                        style={{
                            color: accent,
                            fontSize: 11,
                            fontWeight: "600",
                        }}
                    >
                        {statusLabel}
                    </Text>
                </View>
            </View>

            {code.trim().length > 0 && (
                <Button
                    label="Verify Code"
                    onPress={handleVerify}
                    variant={isDropOff ? "warning" : "primary"}
                    style={{
                        marginTop: spacing[3],
                        paddingVertical: 8,
                        alignSelf: "flex-end",
                    }}
                />
            )}
        </Card>
    );
};

export default function PostHome() {
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();

    const [parcels, setParcels] = useState<PostParcel[]>(MOCK_PARCELS);
    const [search, setSearch] = useState("");

    const filteredParcels = useMemo(() => {
        const query = search.trim().toUpperCase();
        if (!query) return parcels;
        return parcels.filter(
            (parcel) =>
                parcel.tradeId.toUpperCase().includes(query) ||
                parcel.itemName.toUpperCase().includes(query)
        );
    }, [parcels, search]);

    const handleVerified = (parcelId: string) => {
        setParcels((items) => items.filter((item) => item.id !== parcelId));
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top + spacing[4],
                    paddingBottom: spacing[24],
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        paddingHorizontal: spacing[4],
                        marginBottom: spacing[3],
                    }}
                >
                    <PortalSwitcher role="post" />
                </View>

                {/* Blue banner header, per the Post Operator design */}
                <View
                    style={{
                        backgroundColor: colors.info,
                        paddingVertical: spacing[4],
                        alignItems: "center",
                        marginBottom: spacing[5],
                    }}
                >
                    <Text
                        style={{
                            color: "#ffffff",
                            fontSize: 18,
                            fontWeight: "800",
                        }}
                    >
                        Post Operator
                    </Text>
                </View>

                <View style={{ paddingHorizontal: spacing[4] }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing[3],
                            marginBottom: spacing[5],
                        }}
                    >
                        <Input
                            placeholder="Search ID Number..."
                            value={search}
                            onChangeText={setSearch}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            containerStyle={{ flex: 1, marginBottom: 0 }}
                        />
                        <Ionicons name="search" size={24} color={colors.muted} />
                    </View>

                    {filteredParcels.length === 0 ? (
                        <EmptyState
                            title="No Parcels Found"
                            message={
                                search
                                    ? "No parcels match that ID. Check the number and try again."
                                    : "Parcels awaiting drop-off or collection will show up here."
                            }
                        />
                    ) : (
                        filteredParcels.map((parcel) => (
                            <ParcelCard
                                key={parcel.id}
                                parcel={parcel}
                                onVerified={handleVerified}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
