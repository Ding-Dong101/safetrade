import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";

export default function RootLayout() {
    const { colors, isDark } = useTheme();

    return (
        <SafeAreaProvider>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="sign-up" />
                <Stack.Screen name="(buyer)" />
                <Stack.Screen name="(seller)" />
                <Stack.Screen name="(rider)" />
                <Stack.Screen name="(post)" />
            </Stack>
        </SafeAreaProvider>
    );
}
