import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "@/global.css";

export default function RootLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="trade" />
                <Stack.Screen name="escrow" />
                <Stack.Screen name="rider" />
                <Stack.Screen name="admin" />
            </Stack>
        </>
    );
}