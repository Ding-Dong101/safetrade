import Badge from "@/components/ui/Badge";
import { TradeStatus } from "@/types/trade";
import { ViewStyle } from "react-native";

interface TradeStatusBadgeProps {
    status: TradeStatus;
    style?: ViewStyle;
}

const TradeStatusBadge = ({ status, style }: TradeStatusBadgeProps) => {
    return <Badge status={status} style={style} />;
};

export default TradeStatusBadge;