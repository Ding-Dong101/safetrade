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

interface OngoingJobCardProps {
    job: RiderJob;
    onConfirmed: (jobId: string) => void;
}

const OngoingJobCard = ({ job, onConfirmed }: OngoingJobCardProps) => {
    const { colors, spacing } = useTheme();
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isPickup = job.status === "pending_dispatch" || job.status === "accepted";
    const label = isPickup ? "Enter Dispatch Code" : "Enter Drop-Off Code";
    const location = isPickup ? job.pickupLocation : job.dropoffLocation;

    const handleConfirm = async () => {
        if (code.trim().length < 4) {
            Alert.alert("Invalid Code", `Please ${label.toLowerCase()} to continue.`);
            return;
        }

        try {
            setIsSubmitting(true);
            if (isPickup) {
                await confirmPickup(job.id, code);
                Alert.alert("Pickup Confirmed", "You can now deliver the package to the post.");
            } else {
                await confirmDelivery(job.id, code);
                Alert.alert("Delivery Confirmed", "The package has been dropped off.");
            }
            onConfirmed(job.id);
        } catch (err: any) {
            Alert.alert("Error", err?.message ?? "Failed to confirm code");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card style={{ marginBottom: spacing[3] }}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing[2],
                }}
            >
                <Text
                    style={{
                        color: colors.foreground,
                        fontSize: 15,
                        fontWeight: "600",
                    }}
                >
                    {job.buyerName}
                </Text>
                <Badge
                    label={isPickup ? "Pending Dispatch" : "To Drop-Off"}
                    variant={isPickup ? "warning" : "primary"}
                />
            </View>

            <Text
                style={{
                    color: colors.muted,
                    fontSize: 13,
                    marginBottom: spacing[3],
                }}
            >
                Loc: {location}
            </Text>

            <Input
                placeholder={label}
                value={code}
                onChangeText={(value) => setCode(value.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
                containerStyle={{ marginBottom: spacing[3] }}
            />

            <Button
                label="Enter"
                variant={isPickup ? "warning" : "primary"}
                onPress={handleConfirm}
                isLoading={isSubmitting}
                style={{ alignSelf: "flex-end", paddingHorizontal: 32 }}
            />
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

    return (
        <Card style={{ marginBottom: spacing[3] }}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 15,
                            fontWeight: "600",
                            marginBottom: 4,
                        }}
                    >
                        {job.buyerName}
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
