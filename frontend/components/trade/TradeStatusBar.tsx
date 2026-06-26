import { View, Text } from "react-native";
import { colors } from "@/constants/theme";
import { TradeStatus } from "@/types/trade";

interface TradeStatusBarProps {
    status: TradeStatus;
}

const STEPS = [
    "pending",
    "funded",
    "photo_verified",
    "in_transit",
    "at_post",
    "released",
    "closed",
];

const normalizeStatus = (s: string): string => {
    const lower = s?.toLowerCase() ?? "";
    if (lower === "dispatch_pending" || lower === "photo_verified") return "photo_verified";
    if (lower === "delivered") return "at_post";
    return lower;
};

const TradeStatusBar = ({ status }: TradeStatusBarProps) => {
    const normalized = normalizeStatus(status);
    const currentIndex = STEPS.indexOf(normalized);

    return (
        <View style={{ marginTop: 14, width: "100%" }}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "relative",
                    width: "100%",
                }}
            >
                {/* Background line */}
                <View
                    style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        right: 8,
                        height: 2,
                        backgroundColor: colors.border,
                        zIndex: 0,
                    }}
                />

                {/* Active progress line fill */}
                {currentIndex > 0 && (
                    <View
                        style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            width: `${(currentIndex / (STEPS.length - 1)) * 96}%`,
                            height: 2,
                            backgroundColor: colors.primary,
                            zIndex: 1,
                        }}
                    />
                )}

                {/* Dots */}
                {STEPS.map((step, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isActive = idx === currentIndex;
                    const isMuted = idx > currentIndex;

                    return (
                        <View
                            key={step}
                            style={{
                                alignItems: "center",
                                zIndex: 2,
                            }}
                        >
                            <View
                                style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    backgroundColor: isActive
                                        ? colors.primary
                                        : isCompleted
                                        ? colors.primary
                                        : colors.card,
                                    borderWidth: 2,
                                    borderColor: isActive || isCompleted
                                        ? colors.primary
                                        : colors.border,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {(isActive || isCompleted) && (
                                    <View
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: isActive ? "#000" : colors.primary,
                                        }}
                                    />
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 6,
                }}
            >
                <Text style={{ color: currentIndex >= 0 ? colors.primary : colors.muted, fontSize: 9, fontWeight: "600" }}>Start</Text>
                <Text style={{ color: currentIndex >= 3 ? colors.primary : colors.muted, fontSize: 9, fontWeight: "600" }}>Transit</Text>
                <Text style={{ color: currentIndex >= 6 ? colors.primary : colors.muted, fontSize: 9, fontWeight: "600" }}>End</Text>
            </View>
        </View>
    );
};

export default TradeStatusBar;