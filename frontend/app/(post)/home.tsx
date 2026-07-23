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

    const handleVerify = async () => {
        if (code.trim().length < 4) {
            Alert.alert("Invalid Code", "Enter the pick-up code to verify.");
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
            {/* Product name + Trade Code header */}
            <View style={{ marginBottom: spacing[3] }}>
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 16,
                        fontWeight: "700",
                        marginBottom: 3,
                    }}
                    numberOfLines={1}
                >
                    {trade.title && trade.title.trim() ? trade.title : "Untitled Product"}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
                    Trade Code: {trade.tradeCode ?? trade.id}
                </Text>
            </View>

            {isDropOff ? (
                /* ── IN_TRANSIT: Show the generated Drop-Off Code for the rider ── */
                <View>
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 11,
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            marginBottom: spacing[2],
                        }}
                    >
                        Drop-Off Code — give to rider
                    </Text>
                    <View
                        style={{
                            backgroundColor: colors.accent + "22",
                            borderWidth: 1.5,
                            borderColor: colors.accent,
                            borderRadius: 10,
                            paddingVertical: spacing[3],
                            paddingHorizontal: spacing[4],
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: colors.accent,
                                fontSize: 22,
                                fontWeight: "800",
                                letterSpacing: 2,
                                fontVariant: ["tabular-nums"],
                            }}
                            selectable
                        >
                            {trade.dropOffCode ?? "Generating…"}
                        </Text>
                    </View>
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 11,
                            marginTop: spacing[2],
                            textAlign: "center",
                        }}
                    >
                        The rider enters this code in the Rider Portal to confirm receipt.
                    </Text>
                </View>
            ) : (
                /* ── AT_POST: Enter the Buyer's Pick-Up Code ── */
                <View>
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 11,
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            marginBottom: spacing[2],
                        }}
                    >
                        Pick-Up Code — enter buyer's code
                    </Text>
                    <View style={{ flexDirection: "row", gap: spacing[2], alignItems: "center" }}>
                        <TextInput
                            value={code}
                            onChangeText={(value) => setCode(value.toUpperCase())}
                            placeholder="Enter Pick-Up Code"
                            placeholderTextColor={colors.primary + "88"}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            onSubmitEditing={handleVerify}
                            style={{
                                flex: 1,
                                borderWidth: 1.5,
                                borderColor: colors.primary,
                                borderRadius: 8,
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                color: colors.foreground,
                                fontSize: 14,
                                fontWeight: "600",
                                textAlign: "center",
                            }}
                        />
                        <Button
                            label="Confirm"
                            onPress={handleVerify}
                            isLoading={isSubmitting}
                            variant="primary"
                            style={{ paddingVertical: 9, paddingHorizontal: spacing[4] }}
                        />
                    </View>
                    <Text
                        style={{
                            color: colors.muted,
                            fontSize: 11,
                            marginTop: spacing[2],
                        }}
                    >
                        The buyer presents this code at the post office to collect their item.
                    </Text>
                </View>
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
