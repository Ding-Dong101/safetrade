import { View, ViewStyle, TouchableOpacity } from "react-native";
import { colors } from "@/constants/theme";

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
}

const Card = ({ children, style, onPress }: CardProps) => {
    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={[
                    {
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: colors.border,
                    },
                    style,
                ]}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View
            style={[
                {
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
};

export default Card; 