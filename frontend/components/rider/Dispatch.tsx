import { View, Text } from "react-native";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { colors, spacing } from "@/constants/theme";
import { RiderJob } from "@/types/rider";

interface DispatchCardProps {
    job: RiderJob;
    onConfirm?: () => void;
}

const DispatchCard = ({ job, onConfirm }: DispatchCardProps) => {
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
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 15,
                        fontWeight: "600",
                    }}
                >
                    {job.buyerName}
                </Text>
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