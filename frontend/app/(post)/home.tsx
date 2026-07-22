import { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TextInput,
    RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PortalSwitcher from "@/components/home/PortalSwitcher";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { getAllTrades, postDropoff, buyerCollect } from "@/services/tradeService";
import { Trade } from "@/types/trade";

interface ParcelCardProps {
    trade: Trade;
    onVerify: (trade: Trade, code: string) => Promise<void>;
}

const ParcelCard = ({ trade, onVerify }: ParcelCardProps) => {
    const { colors, spacing } = useTheme();
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isDropOff = trade.status === "IN_TRANSIT";
    const accent = isDropOff ? colors.accent : colors.primary;
    const codeLabel = isDropOff ? "Drop-Off Code" : "Pick-Up Code";
    const statusLabel = isDropOff ? "Pending Drop-Off" : "Awaiting Buyer Collection";

    const handleVerify = async () => {
        if (code.trim().length < 4) {
            Alert.alert("Invalid Code", `Enter the ${codeLabel.toLowerCase()} to verify.`);
            return;
        }
        try {
            setIsSubmitting(true);
            await onVerify(trade, code.trim());
        } finally {
            setIsSubmitting(false);
        }
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
                        {trade.title ?? "Parcel"}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
                        ID: {trade.id}
                    </Text>
                </View>

                <View style={{ alignItems: "flex-end", gap: 6 }}>
                    {isDropOff ? (
                        <View
                            style={{
                                borderWidth: 1.5,
                                borderColor: accent,
                                borderRadius: 8,
                                paddingVertical: 6,
                                paddingHorizontal: 12,
                                minWidth: 140,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>
                                {trade.dropOffCode ?? "N/A"}
                            </Text>
                        </View>
                    ) : (
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
                    )}
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

            {!isDropOff && code.trim().length > 0 && (
                <Button
                    label="Verify Code"
                    onPress={handleVerify}
                    isLoading={isSubmitting}
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

    const [parcels, setParcels] = useState<Trade[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadParcels = useCallback(async () => {
        try {
            const trades = await getAllTrades();
            setParcels(
                trades.filter(
                    (trade) =>
                        trade.status === "IN_TRANSIT" || trade.status === "AT_POST"
                )
            );
        } catch (err: any) {
            Alert.alert(
                "Could not load parcels",
                err?.message ?? "Check your connection and try again."
            );
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadParcels();
    }, [loadParcels]);

    const filteredParcels = useMemo(() => {
        const query = search.trim().toUpperCase();
        if (!query) return parcels;
        return parcels.filter(
            (trade) =>
                trade.id.toUpperCase().includes(query) ||
                (trade.title ?? "").toUpperCase().includes(query)
        );
    }, [parcels, search]);

    const handleVerify = async (trade: Trade, code: string) => {
        const isDropOff = trade.status === "IN_TRANSIT";
        try {
            if (isDropOff) {
                await postDropoff(trade.id, code);
                Alert.alert(
                    "Code Verified",
                    `"${trade.title ?? "Parcel"}" has been received at the post.`
                );
            } else {
                await buyerCollect(trade.id, code);
                Alert.alert(
                    "Code Verified",
                    `"${trade.title ?? "Parcel"}" has been released to the buyer and funds sent to the seller.`
                );
            }
            await loadParcels();
        } catch (err: any) {
            Alert.alert(
                "Verification Failed",
                err?.response?.data ??
                    err?.message ??
                    "The code did not match. Please try again."
            );
        }
    };

    if (isLoading) return <LoadingSpinner message="Loading parcels..." />;

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
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => {
                            setIsRefreshing(true);
                            loadParcels();
                        }}
                        tintColor={colors.primary}
                    />
                }
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
                        filteredParcels.map((trade) => (
                            <ParcelCard
                                key={trade.id}
                                trade={trade}
                                onVerify={handleVerify}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
