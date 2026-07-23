import { View, Text } from "react-native";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { RiderJob } from "@/types/rider";

interface DispatchCardProps {
    job: RiderJob;
    onConfirm?: () => void;
}

const DispatchCard = ({ job, onConfirm }: DispatchCardProps) => {
    const { colors, spacing } = useTheme();
    const isUuid = (str?: string) => !!str && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}/.test(str.trim());
    const displayTitle = (job.title && !isUuid(job.title))
        ? job.title
        : (job.buyerName && !isUuid(job.buyerName) ? job.buyerName : "Campus Item");

    return (
        <Card style={{ marginBottom: spacing[3] }}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing[2],
                }}
            >
                <View style={{ flex: 1, paddingRight: spacing[2] }}>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 16,
                            fontWeight: "700",
                            marginBottom: 3,
                        }}
                        numberOfLines={1}
                    >
                        {displayTitle}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
                        Trade Code: {job.tradeCode ?? job.id}
                    </Text>
                </View>
                <Badge label="Pending Dispatch" variant="warning" />
            </View>

            <Text
                style={{
                    color: colors.muted,
                    fontSize: 13,
                    marginBottom: spacing[1],
                }}
            >
                Loc: {job.pickupLocation}
            </Text>

            <Text
                style={{
                    color: colors.mutedForeground,
                    fontSize: 12,
                    marginBottom: spacing[3],
                }}
            >
                Enter Dispatch Code
            </Text>

            {onConfirm && (
                <Button
                    label="Confirm Pickup"
                    onPress={onConfirm}
                    variant="primary"
                />
            )}
        </Card>
    );
};

export default DispatchCard;