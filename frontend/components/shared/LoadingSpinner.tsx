import { View, ActivityIndicator, Text, ViewStyle } from "react-native";
import { colors, spacing } from "@/constants/theme";

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