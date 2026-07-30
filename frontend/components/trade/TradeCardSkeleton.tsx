import { View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Skeleton from "@/components/ui/Skeleton";

const TradeCardSkeleton = () => {
    const { colors, spacing } = useTheme();

    return (
        <View
            style={{
                backgroundColor: colors.card,
                borderRadius: 24,
                padding: 20,
                marginBottom: spacing[3],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 24,
                elevation: 8,
                gap: spacing[3],
            }}
        >
            {/* Row 1: title + status badge */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Skeleton width="45%" height={14} borderRadius={6} />
                <Skeleton width={64} height={24} borderRadius={12} />
            </View>

            {/* Row 2: trade code + price */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Skeleton width="40%" height={11} borderRadius={4} />
                <Skeleton width={70} height={18} borderRadius={6} />
            </View>

            {/* Description line */}
            <Skeleton width="60%" height={11} borderRadius={4} />

            {/* Status bar dots */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing[1] }}>
                {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} width={12} height={12} borderRadius={6} />
                ))}
            </View>
        </View>
    );
};

export default TradeCardSkeleton;
