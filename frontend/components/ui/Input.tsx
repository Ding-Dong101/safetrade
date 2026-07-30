import { useState } from "react";
import { View, Text, TextInput, TextInputProps, ViewStyle, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

const Input = ({ label, error, containerStyle, secureTextEntry, ...props }: InputProps) => {
    const { colors } = useTheme();
    const [isHidden, setIsHidden] = useState(true);

    const isPassword = secureTextEntry === true;

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
            <View style={{ position: "relative", justifyContent: "center" }}>
                <TextInput
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={isPassword ? isHidden : false}
                    style={[
                        {
                            backgroundColor: colors.card,
                            color: colors.foreground,
                            borderRadius: 9999,
                            paddingVertical: 16,
                            paddingLeft: 24,
                            paddingRight: isPassword ? 52 : 24,
                            fontSize: 15,
                            borderWidth: 1,
                            borderColor: error ? colors.danger : colors.border,
                        },
                        props.style,
                    ]}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsHidden((prev) => !prev)}
                        style={{
                            position: "absolute",
                            right: 16,
                            padding: 4,
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons
                            name={isHidden ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={colors.muted}
                        />
                    </TouchableOpacity>
                )}
            </View>
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
