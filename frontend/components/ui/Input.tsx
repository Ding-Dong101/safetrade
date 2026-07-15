import { View, Text, TextInput, TextInputProps, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

const Input = ({ label, error, containerStyle, ...props }: InputProps) => {
    const { colors } = useTheme();

    return (
        <View style={[{ marginBottom: 16 }, containerStyle]}>
            {label && (
                <Text
                    style={{
                        color: colors.muted,
                        fontSize: 13,
                        marginBottom: 6,
                        fontWeight: "500",
                    }}
                >
                    {label}
                </Text>
            )}
            <TextInput
                placeholderTextColor={colors.mutedForeground}
                style={[
                    {
                        backgroundColor: colors.card,
                        color: colors.foreground,
                        borderRadius: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        fontSize: 15,
                        borderWidth: 1,
                        borderColor: error ? colors.danger : colors.border,
                    },
                    props.style,
                ]}
                {...props}
            />
            {error && (
                <Text
                    style={{
                        color: colors.danger,
                        fontSize: 12,
                        marginTop: 4,
                    }}
                >
                    {error}
                </Text>
            )}
        </View>
    );
};

export default Input;
