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
        borderRadius: 24,
        padding: 20,
        borderWidth: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
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
