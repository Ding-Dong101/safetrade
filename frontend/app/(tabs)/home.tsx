import { View, Text } from 'react-native'
import { Link } from 'expo-router'
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

export default function Home() {
    return (
        <SafeAreaView className="flex-1 bg background p-5">
            <Text className="text-xl font-bold text-success">
                HEWARD MILLS
            </Text>
            <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4">
                Go to Onboarding
            </Link>
            <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white p-4">
                Go to Sign In
            </Link>
            <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">
                Go to Sign Up
            </Link>
            <Link href="/Subscriptions/spotify">Spotify Subscriptions</Link>
            <Link href={{ pathname: "/Subscriptions/[id]", params: { id: "claude" } }}>
                Claude Max Subscription
            </Link>
        </SafeAreaView>
    );
}