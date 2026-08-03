import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    Modal,
    ActivityIndicator,
    Alert,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useTrades } from "@/hooks/useTrades";
import { useRole } from "@/hooks/useRole";
import { getMarketplaceListings, joinTradeById, MarketplaceItem } from "@/services/tradeService";
import { formatCurrency } from "@/utils/formatCurrency";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ScreenHeader from "@/components/shared/ScreenHeader";

const CATEGORIES = [
    { id: "all", label: "All Items", icon: "grid-outline" },
    { id: "phones", label: "Phones & Tablets", icon: "phone-portrait-outline" },
    { id: "laptops", label: "Laptops & Tech", icon: "laptop-outline" },
    { id: "fashion", label: "Fashion & Shoes", icon: "shirt-outline" },
    { id: "others", label: "Others", icon: "cube-outline" },
];

export default function MarketplaceScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { user } = useAuth();
    const { role, setRole } = useRole();
    const { refetch: refetchUserTrades } = useTrades();

    const [listings, setListings] = useState<MarketplaceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
    const [isJoining, setIsJoining] = useState(false);

    const fetchListings = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) setIsLoading(true);
            const data = await getMarketplaceListings();
            setListings(data);
        } catch (err) {
            console.error("Failed to load marketplace listings:", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchListings();

        // Live Auto-Refresh every 6 seconds to show newly listed items in real-time
        const interval = setInterval(() => {
            fetchListings(true);
        }, 6000);

        return () => clearInterval(interval);
    }, [fetchListings]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchListings(true);
    };

    const handleQuickBuy = async (item: MarketplaceItem) => {
        if (user && item.sellerId === user.id) {
            Alert.alert("Your Item", "You are the seller of this listing. You cannot accept your own trade.");
            return;
        }

        try {
            setIsJoining(true);
            // Switch role to buyer if currently seller
            if (role !== "buyer") {
                setRole("buyer");
            }
            const trade = await joinTradeById(item.id);
            await refetchUserTrades();
            setSelectedItem(null);
            Alert.alert(
                "Trade Accepted! 🛡️",
                `You have accepted "${trade.title}". Proceed to escrow payment to lock funds securely.`,
                [
                    {
                        text: "Go to Escrow Payment",
                        onPress: () => router.push(`/trade/${trade.id}` as any),
                    },
                ]
            );
        } catch (err: any) {
            const msg = typeof err?.response?.data === "string" ? err.response.data : (err?.message ?? "Failed to join trade.");
            Alert.alert("Accept Failed", msg);
        } finally {
            setIsJoining(false);
        }
    };

    // Filter by query and category
    const filteredListings = listings.filter((item) => {
        const matchesQuery =
            (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.pickupLocation && item.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.sellerName && item.sellerName.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesQuery) return false;

        if (selectedCategory === "all") return true;
        const text = `${item.title} ${item.description || ""}`.toLowerCase();
        if (selectedCategory === "phones") {
            return text.includes("phone") || text.includes("iphone") || text.includes("samsung") || text.includes("ipad") || text.includes("tablet");
        }
        if (selectedCategory === "laptops") {
            return text.includes("laptop") || text.includes("macbook") || text.includes("dell") || text.includes("hp") || text.includes("pc");
        }
        if (selectedCategory === "fashion") {
            return text.includes("shoe") || text.includes("sneaker") || text.includes("watch") || text.includes("bag") || text.includes("dress") || text.includes("shirt");
        }
        return true;
    });

    const renderItemCard = ({ item }: { item: MarketplaceItem }) => {
        const isOwnListing = user?.id === item.sellerId;

        return (
            <Card
                onPress={() => setSelectedItem(item)}
                style={{
                    marginBottom: spacing[4],
                    padding: 0,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: colors.border,
                }}
            >
                {/* Product Photo or Placeholder */}
                <View
                    style={{
                        height: 170,
                        backgroundColor: colors.cardAlt,
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    {item.itemPhotoBase64 ? (
                        <Image
                            source={{ uri: item.itemPhotoBase64 }}
                            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                        />
                    ) : (
                        <View style={{ alignItems: "center", gap: 6 }}>
                            <Ionicons name="bag-handle-outline" size={48} color={colors.muted} />
                            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>
                                Verified SafeTrade Item
                            </Text>
                        </View>
                    )}

                    {/* Escrow Badge overlay */}
                    <View
                        style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            backgroundColor: "rgba(0,0,0,0.7)",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
                        <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 }}>
                            ESCROW SECURED
                        </Text>
                    </View>

                    {item.pickupLocation && (
                        <View
                            style={{
                                position: "absolute",
                                bottom: 10,
                                left: 10,
                                backgroundColor: "rgba(0,0,0,0.65)",
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 8,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <Ionicons name="location-outline" size={12} color="#FFFFFF" />
                            <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>
                                {item.pickupLocation}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={{ padding: spacing[4], gap: spacing[2] }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 16,
                                fontWeight: "800",
                                flex: 1,
                                marginRight: spacing[2],
                            }}
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>
                        <Text
                            style={{
                                color: colors.primary,
                                fontSize: 18,
                                fontWeight: "800",
                            }}
                        >
                            {formatCurrency(item.price)}
                        </Text>
                    </View>

                    {item.description ? (
                        <Text
                            style={{
                                color: colors.muted,
                                fontSize: 13,
                                lineHeight: 18,
                            }}
                            numberOfLines={2}
                        >
                            {item.description}
                        </Text>
                    ) : null}

                    {/* Seller details & Buy Action */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderTopWidth: 1,
                            borderColor: colors.border,
                            paddingTop: spacing[3],
                            marginTop: spacing[1],
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <View
                                style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 13,
                                    backgroundColor: `${colors.primary}20`,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Ionicons name="person" size={13} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700" }}>
                                    {item.sellerName}
                                </Text>
                                <Text style={{ color: colors.muted, fontSize: 10 }}>
                                    ⭐ 5.0 (Verified Seller)
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => setSelectedItem(item)}
                            activeOpacity={0.8}
                            style={{
                                backgroundColor: isOwnListing ? colors.cardAlt : colors.primary,
                                borderWidth: isOwnListing ? 1 : 0,
                                borderColor: colors.border,
                                paddingHorizontal: spacing[4],
                                paddingVertical: spacing[2],
                                borderRadius: 10,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <Ionicons
                                name={isOwnListing ? "eye-outline" : "shield-checkmark"}
                                size={14}
                                color={isOwnListing ? colors.foreground : colors.background}
                            />
                            <Text
                                style={{
                                    color: isOwnListing ? colors.foreground : colors.background,
                                    fontSize: 12,
                                    fontWeight: "800",
                                }}
                            >
                                {isOwnListing ? "Your Item" : "Buy with Escrow"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenHeader
                title="SafeTrade Marketplace"
                subtitle="Browse items verified with 100% Escrow Protection"
            />

            {/* Search Bar */}
            <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[2] }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 14,
                        paddingHorizontal: spacing[3],
                        height: 46,
                        gap: 8,
                    }}
                >
                    <Ionicons name="search" size={18} color={colors.muted} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search items, sellers, locations..."
                        placeholderTextColor={colors.muted}
                        style={{
                            flex: 1,
                            color: colors.foreground,
                            fontSize: 14,
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={18} color={colors.muted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Category Filter Chips */}
            <View style={{ paddingBottom: spacing[2] }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing[4], gap: 8 }}
                >
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => setSelectedCategory(cat.id)}
                                activeOpacity={0.7}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                    backgroundColor: isSelected ? colors.primary : colors.card,
                                    borderWidth: 1,
                                    borderColor: isSelected ? colors.primary : colors.border,
                                    paddingHorizontal: 12,
                                    paddingVertical: 7,
                                    borderRadius: 12,
                                }}
                            >
                                <Ionicons
                                    name={cat.icon as any}
                                    size={14}
                                    color={isSelected ? colors.background : colors.muted}
                                />
                                <Text
                                    style={{
                                        color: isSelected ? colors.background : colors.foreground,
                                        fontSize: 12,
                                        fontWeight: isSelected ? "700" : "500",
                                    }}
                                >
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Listings List */}
            {isLoading && !isRefreshing ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.muted, marginTop: spacing[3], fontSize: 13 }}>
                        Loading verified listings...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredListings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItemCard}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                    }
                    contentContainerStyle={{
                        paddingHorizontal: spacing[4],
                        paddingTop: spacing[2],
                        paddingBottom: insets.bottom + 100,
                    }}
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 }}>
                            <Ionicons name="storefront-outline" size={54} color={colors.muted} />
                            <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "700" }}>
                                {searchQuery ? "No Items Found" : "No Open Listings"}
                            </Text>
                            <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center", maxWidth: 280, lineHeight: 18 }}>
                                {searchQuery
                                    ? "Try searching for a different keyword or category."
                                    : "Sellers are currently completing trades. Create a trade to list your item here!"}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* ── Quick Buy / Item Detail Modal ── */}
            <Modal
                visible={!!selectedItem}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedItem(null)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                maxHeight: "88%",
                            },
                        ]}
                    >
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing[5], gap: spacing[4] }}>
                            {/* Header */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                    <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                                    <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>
                                        SafeTrade Escrow Deal
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setSelectedItem(null)}>
                                    <Ionicons name="close" size={22} color={colors.muted} />
                                </TouchableOpacity>
                            </View>

                            {/* Photo */}
                            {selectedItem?.itemPhotoBase64 ? (
                                <Image
                                    source={{ uri: selectedItem.itemPhotoBase64 }}
                                    style={{
                                        width: "100%",
                                        height: 220,
                                        borderRadius: 16,
                                        resizeMode: "cover",
                                    }}
                                />
                            ) : null}

                            {/* Item Title & Price */}
                            <View>
                                <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>
                                    {selectedItem?.title}
                                </Text>
                                <Text style={{ color: colors.primary, fontSize: 26, fontWeight: "800", marginTop: 4 }}>
                                    {formatCurrency(selectedItem?.price ?? 0)}
                                </Text>
                            </View>

                            {/* Escrow Guarantee Box */}
                            <View
                                style={{
                                    backgroundColor: `${colors.primary}12`,
                                    borderWidth: 1,
                                    borderColor: `${colors.primary}35`,
                                    borderRadius: 14,
                                    padding: spacing[3],
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <Ionicons name="lock-closed" size={22} color={colors.primary} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>
                                        100% Money-Back Escrow
                                    </Text>
                                    <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                                        Your payment stays locked until you physically inspect the item with the rider.
                                    </Text>
                                </View>
                            </View>

                            {/* Seller & Location Specs */}
                            <View
                                style={{
                                    backgroundColor: colors.cardAlt,
                                    borderRadius: 14,
                                    padding: spacing[4],
                                    gap: spacing[2],
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                }}
                            >
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.muted, fontSize: 13 }}>Seller</Text>
                                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>
                                        {selectedItem?.sellerName}
                                    </Text>
                                </View>
                                {selectedItem?.pickupLocation && (
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <Text style={{ color: colors.muted, fontSize: 13 }}>Pickup Location</Text>
                                        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>
                                            {selectedItem.pickupLocation}
                                        </Text>
                                    </View>
                                )}
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.muted, fontSize: 13 }}>Trade Code</Text>
                                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>
                                        {selectedItem?.tradeCode}
                                    </Text>
                                </View>
                            </View>

                            {selectedItem?.description ? (
                                <View>
                                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700", marginBottom: 4 }}>
                                        Description
                                    </Text>
                                    <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
                                        {selectedItem.description}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Accept Trade Button */}
                            <Button
                                label={
                                    user?.id === selectedItem?.sellerId
                                        ? "Your Listing"
                                        : "Accept Trade & Pay Escrow 🛡️"
                                }
                                onPress={() => selectedItem && handleQuickBuy(selectedItem)}
                                isLoading={isJoining}
                                disabled={user?.id === selectedItem?.sellerId}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
        justifyContent: "flex-end",
    },
    modalContent: {
        width: "100%",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 1,
    },
});
