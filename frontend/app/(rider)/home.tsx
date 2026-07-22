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
import { RiderJob } from "@/types/rider";
import {
    confirmDelivery,
    confirmPickup,
    getOngoingJobs,
} from "@/services/riderService";
import { useRouter } from "expo-router";

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


export default function RiderHome() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const { user } = useAuth();

    const [ongoing, setOngoing] = useState<RiderJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const ongoingJobs = await getOngoingJobs();
                setOngoing(ongoingJobs);
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
