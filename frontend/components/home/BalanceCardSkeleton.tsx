import { View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Skeleton from "@/components/ui/Skeleton";

const BalanceCardSkeleton = () => {
    const { colors, spacing } = useTheme();

    return (
        <View
            style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: spacing[5],
                borderWidth: 1,
                borderColor: colors.border,
                gap: spacing[4],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
            }}
        >
            {/* Top row: Available | Total */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing[10] }}>
                <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton width={60} height={10} borderRadius={4} />
                    <Skeleton width="70%" height={22} borderRadius={6} />
                </View>
                <View style={{ flex: 1, alignItems: "flex-end", gap: 8 }}>
                    <Skeleton width={40} height={10} borderRadius={4} />
                    <Skeleton width="70%" height={22} borderRadius={6} />
                </View>
            </View>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: colors.border }} />

            {/* Bottom row: escrow + active deals | top-up button */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ gap: 6 }}>
                    <Skeleton width={110} height={12} borderRadius={4} />
                    <Skeleton width={80} height={12} borderRadius={4} />
                </View>
                <Skeleton width={80} height={32} borderRadius={10} />
            </View>
        </View>
    );
};

export default BalanceCardSkeleton;
