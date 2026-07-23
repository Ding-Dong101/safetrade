import { useCallback, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PortalSwitcher from "@/components/home/PortalSwitcher";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_USER } from "@/constants/data";
import { RiderJob } from "@/types/rider";
import {
    confirmDelivery,
    confirmPickup,
    getOngoingJobs,
} from "@/services/riderService";
import { useFocusEffect, useRouter } from "expo-router";

interface OngoingJobCardProps {
    job: RiderJob;
    onConfirmed: (jobId: string) => void;
}

const isUuidString = (str?: string) => !!str && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}/.test(str.trim());

const getCleanTitle = (title?: string, fallbackName?: string) => {
    if (title && title.trim().length > 0 && !isUuidString(title)) {
        return title.trim();
    }
    if (fallbackName && fallbackName.trim().length > 0 && !isUuidString(fallbackName)) {
        return fallbackName.trim();
    }
    return "Campus Parcel";
};

const OngoingJobCard = ({ job, onConfirmed }: OngoingJobCardProps) => {
    const { colors, spacing } = useTheme();
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isPickup = job.status === "pending_dispatch" || job.status === "accepted";
    const isInTransit = job.status === "in_transit";
    const displayTitle = getCleanTitle(job.title, job.buyerName);

    const handleConfirm = async () => {
        if (code.trim().length < 4) {
            Alert.alert("Invalid Code", "Please enter a valid code to continue.");
            return;
        }
        try {
            setIsSubmitting(true);
            if (isPickup) {
                await confirmPickup(job.id, code);
                Alert.alert("Pickup Confirmed", "You can now deliver the package.");
                onConfirmed(job.id);
            } else {
                const result = await confirmDelivery(job.id, code);
                if (result.status === "RELEASED") {
                    Alert.alert(
                        "✅ Trade Complete",
                        "Direct delivery confirmed. Funds have been released to the seller."
                    );
                } else {
                    Alert.alert(
                        "📦 Package Received at Post",
                        "The package has been logged at the post office. The buyer will collect it using their pick-up code."
                    );
                }
                onConfirmed(job.id);
            }
        } catch (err: any) {
            Alert.alert(
                "Invalid Code",
                err?.response?.data ?? err?.message ?? "The code did not match. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card style={{ marginBottom: spacing[3] }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing[2],
                }}
            >
                <View style={{ flex: 1, paddingRight: spacing[2] }}>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 16,
                            fontWeight: "700",
                            marginBottom: 3,
                        }}
                        numberOfLines={1}
                    >
                        {displayTitle}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
                        Trade Code: {job.tradeCode ?? job.id}
                    </Text>
                </View>
                <Badge
                    label={isPickup ? "Pending Dispatch" : "In Transit"}
                    variant={isPickup ? "warning" : "primary"}
                />
            </View>

            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: spacing[3] }}>
                {isPickup ? `Pick up from: ${job.pickupLocation}` : `Drop off to: ${job.dropoffLocation}`}
            </Text>

            {isInTransit ? (
                <View>
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: spacing[1] }}>
                        Delivery Confirmation
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginBottom: spacing[3] }}>
                        Ask the buyer for their 6-digit Delivery Code upon handing over the parcel.
                    </Text>
                    <Input
                        placeholder="Enter Buyer's Delivery Code"
                        value={code}
                        onChangeText={(value) => setCode(value.toUpperCase())}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        containerStyle={{ marginBottom: spacing[3] }}
                    />
                    <Button
                        label="Confirm Delivery & Complete Trade"
                        variant="primary"
                        onPress={handleConfirm}
                        isLoading={isSubmitting}
                        style={{ alignSelf: "stretch" }}
                    />
                </View>
            ) : (
                /* ── Standard dispatch code entry ── */
                <View>
                    <Input
                        placeholder="Enter Dispatch Code"
                        value={code}
                        onChangeText={(value) => setCode(value.toUpperCase())}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        containerStyle={{ marginBottom: spacing[3] }}
                    />
                    <Button
                        label="Confirm Pickup"
                        variant="warning"
                        onPress={handleConfirm}
                        isLoading={isSubmitting}
                        style={{ alignSelf: "flex-end", paddingHorizontal: 32 }}
                    />
                </View>
            )}
        </Card>
    );
};

export default function RiderHome() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const { user } = useAuth();

    const [ongoing, setOngoing] = useState<RiderJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                try {
                    const ongoingJobs = await getOngoingJobs();
                    setOngoing(ongoingJobs);
                } finally {
                    setIsLoading(false);
                }
            };
            load();
        }, [])
    );

    const handleConfirmed = (jobId: string) => {
        setOngoing((jobs) =>
            jobs
                .map((job) =>
                    job.id === jobId
                        ? job.status === "pending_dispatch" || job.status === "accepted"
                            ? { ...job, status: "in_transit" as const }
                            : null
                        : job
                )
                .filter((job): job is RiderJob => job !== null)
        );
    };


    if (isLoading) {
        return <LoadingSpinner message="Loading deliveries..." />;
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing[4],
                    paddingTop: insets.top + spacing[4],
                    paddingBottom: spacing[24],
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: spacing[5],
                    }}
                >
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 24,
                            fontWeight: "800",
                        }}
                    >
                        Hello {user?.firstName ?? MOCK_USER.name},
                    </Text>
                    <PortalSwitcher role="rider" />
                </View>

                <Button
    label="Enter Delivery Code"
    onPress={() => router.push("/(rider)/enter-code")}
    style={{ marginBottom: spacing[5] }}
               />

                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 18,
                        fontWeight: "700",
                        textDecorationLine: "underline",
                        marginBottom: spacing[3],
                    }}
                >
                    Ongoing
                </Text>

                {ongoing.length === 0 ? (
                    <EmptyState
                        title="No Ongoing Deliveries"
                        message="Accept a job below to start delivering."
                    />
                ) : (
                    ongoing.map((job) => (
                        <OngoingJobCard
                            key={job.id}
                            job={job}
                            onConfirmed={handleConfirmed}
                        />
                    ))
                )}


            </ScrollView>
        </KeyboardAvoidingView>
    );
}
