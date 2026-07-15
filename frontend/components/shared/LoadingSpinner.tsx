import { View, ActivityIndicator, Text, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface LoadingSpinnerProps {
    message?: string;
    size?: "small" | "large";
    style?: ViewStyle;
}

const LoadingSpinner = ({
    message,
    size = "large",
    style,
}: LoadingSpinnerProps) => {
    const { colors, spacing } = useTheme();

    return (
        <View
            style={[
                {
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing[3],
                },
                style,
            ]}
        >
            <ActivityIndicator size={size} color={colors.primary} />
            {message && (
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 14,
                    }}
                >
                    {message}
                </Text>
            )}
        </View>
    );
};

export default LoadingSpinner;