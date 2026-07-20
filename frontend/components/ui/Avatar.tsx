import { View, Text, Image, ImageSourcePropType, ImageStyle, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface AvatarProps {
    name?: string;
    source?: ImageSourcePropType;
    size?: number;
    style?: ViewStyle & ImageStyle;
}

const getInitials = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Avatar = ({ name, source, size = 44, style }: AvatarProps) => {
    const { colors } = useTheme();
    if (source) {
        return (
            <Image
                source={source}
                style={[
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    },
                    style,
                ]}
            />
        );
    }

    return (
        <View
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                },
                style,
            ]}
        >
            <Text
                style={{
                    color: colors.background,
                    fontSize: size * 0.4,
                    fontWeight: "700",
                }}
            >
                {name ? getInitials(name) : "?"}
            </Text>
        </View>
    );
};

export default Avatar;