import { View, Text, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Button from "@/components/ui/Button";

interface EmptyStateProps {
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

const EmptyState = ({
    title,
    message,
    actionLabel,
    onAction,
    style,
}: EmptyStateProps) => {
    const { colors, spacing } = useTheme();

    return (
        <View
            style={[
                {
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: spacing[6],
                    gap: spacing[3],
                },
                style,
            ]}
        >
            <Text
                style={{
                    fontSize: 40,
                }}
            >
                📭
            </Text>

            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 18,
                    fontWeight: "700",
                    textAlign: "center",
                }}
            >
                {title}
            </Text>

            {message && (
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 14,
                        textAlign: "center",
                        lineHeight: 22,
                    }}
                >
                    {message}
                </Text>
            )}

            {actionLabel && onAction && (
                <Button
                    label={actionLabel}
                    onPress={onAction}
                    style={{ marginTop: spacing[2] }}
                />
            )}
        </View>
    );
};

export default EmptyState;