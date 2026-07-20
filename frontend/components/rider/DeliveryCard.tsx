import { View, Text } from "react-native";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { RiderJob } from "@/types/rider";
import { useState } from "react";

interface DeliveryCardProps {
    job: RiderJob;
    onConfirm?: () => void;
}

const DeliveryCard = ({ job, onConfirm }: DeliveryCardProps) => {
    const { colors, spacing } = useTheme();
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
                <Badge label="To Drop-Off" variant="info" />
            </View>

            <Text
                style={{
                    color: colors.muted,
                    fontSize: 13,
                    marginBottom: spacing[1],
                }}
            >
                Loc: {job.dropoffLocation}
            </Text>

            <Text
                style={{
                    color: colors.mutedForeground,
                    fontSize: 12,
                    marginBottom: spacing[3],
                }}
            >
                Enter Drop-Off Code
            </Text>

            {onConfirm && (
                <Button
                    label="Confirm Delivery"
                    onPress={onConfirm}
                    variant="primary"
                />
            )}
        </Card>
    );
};

export default DeliveryCard;