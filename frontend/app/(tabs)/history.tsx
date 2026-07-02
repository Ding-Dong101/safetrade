import { View, Text } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function History() {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: insets.top + spacing[4],
                paddingHorizontal: spacing[4],
            }}
        >
            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 22,
                    fontWeight: "700",
                    marginBottom: spacing[4],
                }}
            >
                History
            </Text>

            <Text style={{ color: colors.muted, fontSize: 14 }}>
                Your trade history will appear here.
            </Text>
        </View>
    );
}