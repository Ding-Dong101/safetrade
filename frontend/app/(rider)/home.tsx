import { useEffect, useState } from "react";
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
import { AvailableJob, RiderJob } from "@/types/rider";
import {
    acceptJob,
    confirmDelivery,
    confirmPickup,
    getAvailableJobs,
    getOngoingJobs,
} from "@/services/riderService";
import { useRouter } from "expo-router";

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
                /* ── Dual path section for IN_TRANSIT jobs ── */
                <View style={{ gap: spacing[4] }}>
                    {/* Option A: Buyer gives code directly */}
                    <View>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: spacing[2],
                                marginBottom: spacing[2],
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: colors.primary + "22",
                                    borderRadius: 12,
                                    paddingHorizontal: spacing[2],
                                    paddingVertical: 2,
                                }}
                            >
                                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "700" }}>
                                    PATH A
                                </Text>
                            </View>
                            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>
                                Direct Delivery to Buyer
                            </Text>
                        </View>
                        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: spacing[2] }}>
                            The buyer gives you their Direct Delivery Code. Enter it below to complete the trade and release funds immediately.
                        </Text>
                        <Input
                            placeholder="Enter Buyer's Delivery Code"
                            value={code}
                            onChangeText={(value) => setCode(value.toUpperCase())}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            containerStyle={{ marginBottom: spacing[2] }}
                        />
                        <Button
                            label="Confirm Direct Delivery"
                            variant="primary"
                            onPress={handleConfirm}
                            isLoading={isSubmitting}
                            style={{ alignSelf: "stretch" }}
                        />
                    </View>

                    {/* Divider */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>OR</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                    </View>

                    {/* Option B: Post Office drop-off */}
                    <View>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: spacing[2],
                                marginBottom: spacing[2],
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: colors.accent + "22",
                                    borderRadius: 12,
                                    paddingHorizontal: spacing[2],
                                    paddingVertical: 2,
                                }}
                            >
                                <Text style={{ color: colors.accent, fontSize: 10, fontWeight: "700" }}>
                                    PATH B
                                </Text>
                            </View>
                            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>
                                Drop Off at Post Office
                            </Text>
                        </View>
                        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: spacing[2] }}>
                            The post operator shows you the Drop-Off Code from their portal. Enter it below to confirm receipt at the post.
                        </Text>
                        <Input
                            placeholder="Enter Post Drop-Off Code"
                            value={code}
                            onChangeText={(value) => setCode(value.toUpperCase())}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            containerStyle={{ marginBottom: spacing[2] }}
                        />
                        <Button
                            label="Confirm Post Drop-Off"
                            variant="warning"
                            onPress={handleConfirm}
                            isLoading={isSubmitting}
                            style={{ alignSelf: "stretch" }}
                        />
                    </View>
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

interface AvailableJobRowProps {
    job: AvailableJob;
    onAccept: (job: AvailableJob) => void;
    onIgnore: (jobId: string) => void;
}

const AvailableJobRow = ({ job, onAccept, onIgnore }: AvailableJobRowProps) => {
    const { colors, spacing } = useTheme();
    const displayTitle = getCleanTitle(job.title, job.buyerName);

    return (
        <Card style={{ marginBottom: spacing[3] }}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                    <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }} numberOfLines={1}>
                        Trade Code: {job.tradeCode ?? job.id}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>
                        Loc: {job.pickupLocation}
                    </Text>
                </View>

                <View style={{ gap: spacing[2] }}>
                    <Button
                        label="Accept"
                        onPress={() => onAccept(job)}
                        style={{ paddingVertical: 8, paddingHorizontal: 20 }}
                    />
                    <Button
                        label="Ignore"
                        variant="outlined"
                        onPress={() => onIgnore(job.id)}
                        style={{ paddingVertical: 8, paddingHorizontal: 20 }}
                    />
                </View>
            </View>
        </Card>
    );
};

export default function RiderHome() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const { user } = useAuth();

    const [ongoing, setOngoing] = useState<RiderJob[]>([]);
    const [available, setAvailable] = useState<AvailableJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [ongoingJobs, availableJobs] = await Promise.all([
                    getOngoingJobs(),
                    getAvailableJobs(),
                ]);
                setOngoing(ongoingJobs);
                setAvailable(availableJobs);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

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

    const handleAccept = async (job: AvailableJob) => {
        await acceptJob(job.id);
        setAvailable((jobs) => jobs.filter((item) => item.id !== job.id));
        setOngoing((jobs) => [
            ...jobs,
            {
                id: job.id,
                tradeId: job.tradeId,
                buyerName: job.buyerName,
                sellerName: "",
                pickupLocation: job.pickupLocation,
                dropoffLocation: job.dropoffLocation,
                status: "pending_dispatch",
                assignedAt: new Date().toISOString(),
            },
        ]);
    };

    const handleIgnore = (jobId: string) => {
        setAvailable((jobs) => jobs.filter((item) => item.id !== jobId));
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

                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 18,
                        fontWeight: "700",
                        textDecorationLine: "underline",
                        marginTop: spacing[5],
                        marginBottom: spacing[3],
                    }}
                >
                    Available
                </Text>

                {available.length === 0 ? (
                    <EmptyState
                        title="No Available Jobs"
                        message="New delivery jobs will show up here."
                    />
                ) : (
                    available.map((job) => (
                        <AvailableJobRow
                            key={job.id}
                            job={job}
                            onAccept={handleAccept}
                            onIgnore={handleIgnore}
                        />
                    ))
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
