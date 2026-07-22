import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

type ButtonVariant = "primary" | "secondary" | "outlined" | "danger" | "warning";

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const Button = ({
    label,
    onPress,
    variant = "primary",
    isLoading = false,
    disabled = false,
    style,
    textStyle,
}: ButtonProps) => {
    const { colors } = useTheme();

    const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
        primary: {
            container: { backgroundColor: colors.primary },
            text: { color: colors.background },
        },
        secondary: {
            container: { backgroundColor: colors.card },
            text: { color: colors.foreground },
        },
        outlined: {
            container: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.primary },
            text: { color: colors.primary },
        },
        danger: {
            container: { backgroundColor: colors.danger },
            text: { color: "#ffffff" },
        },
        warning: {
            container: { backgroundColor: colors.warning },
            text: { color: colors.background },
        },
    };

    const { container, text } = variantStyles[variant];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            style={[
                {
                    paddingVertical: 16,
                    paddingHorizontal: 32,
                    borderRadius: 9999,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: disabled || isLoading ? 0.6 : 1,
                    ...(variant === "primary" ? {
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                    } : {})
                },
                container,
                style,
            ]}
        >
            {isLoading ? (
                <ActivityIndicator color={text.color as string} />
            ) : (
                <Text
                    style={[
                        {
                            fontSize: 15,
                            fontWeight: "600",
                        },
                        text,
                        textStyle,
                    ]}
                >
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default Button;
