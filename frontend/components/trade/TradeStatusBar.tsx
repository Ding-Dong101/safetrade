import { View } from "react-native";
import { colors } from "@/constants/theme";
import { TradeStatus } from "@/types/trade";
import { TRADE_STATUSES } from "@/constants/data";

interface TradeStatusBarProps {
    status: TradeStatus;
}

const TradeStatusBar = ({ status }: TradeStatusBarProps) => {
    const currentIndex = TRADE_STATUSES.indexOf(status);
    const total = TRADE_STATUSES.length;
    const progress = (currentIndex + 1) / total;

    return (
        <View
            style={{
                height: 4,
                backgroundColor: colors.border,
                borderRadius: 2,
                overflow: "hidden",
                marginTop: 12,
            }}
        >
            <View
                style={{
                    height: "100%",
                    width: `${progress * 100}%`,
                    backgroundColor: colors.primary,
                    borderRadius: 2,
                }}
            />
        </View>
    );
};

export default TradeStatusBar;