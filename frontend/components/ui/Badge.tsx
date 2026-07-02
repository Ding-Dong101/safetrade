import { View, Text, ViewStyle } from "react-native";
import { colors } from "@/constants/theme";
import { TradeStatus } from "@/types/trade";
import { formatTradeStatus } from "@/utils/formatStatus";

type BadgeVariant = "primary" | "warning" | "danger" | "success" | "info" | "purple" | "muted";

interface BadgeProps {
    label?: string;
    status?: TradeStatus;
    variant?: BadgeVariant;
    style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: { bg: colors.primary, text: colors.background },
    warning: { bg: colors.warning, text: colors.background },
    danger: { bg: colors.danger, text: colors.foreground },
    success: { bg: colors.success, text: colors.foreground },
    info: { bg: colors.info, text: colors.foreground },
    purple: { bg: colors.purple, text: colors.foreground },
    muted: { bg: colors.card, text: colors.muted },
};

const statusVariantMap: Record<string, BadgeVariant> = {
    created: "warning",
    pending: "warning",
    funded: "success",
    photo_verified: "info",
    dispatch_pending: "info",
    in_transit: "info",
    at_post: "purple",
    released: "primary",
    closed: "muted",
    delivered: "purple",
    refunded: "danger",
};

const Badge = ({ label, status, variant, style }: BadgeProps) => {
    const normalizedStatus = status ? status.toLowerCase() : "";
    const resolvedVariant = variant ?? (status ? (statusVariantMap[normalizedStatus] ?? "muted") : "muted");
    const resolvedLabel = label ?? (status ? formatTradeStatus(status as any) : "");
    const { bg, text } = variantColors[resolvedVariant];

    return (
        <View
            style={[
                {
                    backgroundColor: bg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                    alignSelf: "flex-start",
                },
                style,
            ]}
        >
            <Text
                style={{
                    color: text,
                    fontSize: 11,
                    fontWeight: "600",
                }}
            >
                {resolvedLabel}
            </Text>
        </View>
    );
};

export default Badge;