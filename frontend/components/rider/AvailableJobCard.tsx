import { View, Text } from "react-native";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { AvailableJob } from "@/types/rider";

interface AvailableJobCardProps {
    job: AvailableJob;
    onAccept?: () => void;
    onIgnore?: () => void;
}

const AvailableJobCard = ({ job, onAccept, onIgnore }: AvailableJobCardProps) => {
    const { colors, spacing } = useTheme();
    return (
        <Card style={{ marginBottom: spacing[3] }}>
            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 15,
                    fontWeight: "600",
                    marginBottom: spacing[1],
                }}
            >
                {job.buyerName}
            </Text>

            <Text
                style={{
                    color: colors.muted,
                    fontSize: 13,
                    marginBottom: spacing[1],
                }}
            >
                Loc: {job.pickupLocation}
            </Text>

            {job.estimatedDistance && (
                <Text
                    style={{
                        color: colors.mutedForeground,
                        fontSize: 12,
                        marginBottom: spacing[3],
                    }}
                >
                    {job.estimatedDistance} away
                </Text>
            )}

            <View
                style={{
                    flexDirection: "row",
                    gap: spacing[2],
                }}
            >
                <Button
                    label="Accept"
                    onPress={onAccept ?? (() => {})}
                    variant="primary"
                    style={{ flex: 1 }}
                />
                <Button
                    label="Ignore"
                    onPress={onIgnore ?? (() => {})}
                    variant="danger"
                    style={{ flex: 1 }}
                />
            </View>
        </Card>
    );
};

export default AvailableJobCard;