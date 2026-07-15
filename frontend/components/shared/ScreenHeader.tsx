import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

interface ScreenHeaderProps {
    title: string;
    showBack?: boolean;
    rightElement?: React.ReactNode;
}

const ScreenHeader = ({ title, showBack = true, rightElement }: ScreenHeaderProps) => {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: spacing[4],
                paddingVertical: spacing[3],
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: colors.background,
            }}
        >
            {showBack ? (
                <TouchableOpacity onPress={() => router.back()}>
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 15,
                            fontWeight: "500",
                        }}
                    >
                        ← Back
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={{ width: 60 }} />
            )}

            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 17,
                    fontWeight: "700",
                }}
            >
                {title}
            </Text>

            <View style={{ width: 60, alignItems: "flex-end" }}>
                {rightElement ?? null}
            </View>
        </View>
    );
};

export default ScreenHeader;