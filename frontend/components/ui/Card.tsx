import { View, ViewStyle, TouchableOpacity } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
}

const Card = ({ children, style, onPress }: CardProps) => {
    const { colors } = useTheme();

    const baseStyle: ViewStyle = {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    };

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={[baseStyle, style]}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={[baseStyle, style]}>{children}</View>;
};

export default Card;
