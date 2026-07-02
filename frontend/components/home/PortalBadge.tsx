import { View, Text } from "react-native";
import { colors } from "@/constants/theme";
import { Role } from "@/types/auth";

interface PortalBadgeProps {
    role: Role;
}

const roleConfig: Record<Role, { label: string; color: string }> = {
    buyer: { label: "Buyer Portal", color: colors.info },
    seller: { label: "Seller Portal", color: colors.purple },
    rider: { label: "Rider Portal", color: colors.primary },
    post: { label: "Post Portal", color: colors.accent },
};

const PortalBadge = ({ role }: PortalBadgeProps) => {
    const { label, color } = roleConfig[role];

    return (
        <View
            style={{
                backgroundColor: color,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
                alignSelf: "flex-start",
            }}
        >
            <Text
                style={{
                    color: colors.foreground,
                    fontSize: 11,
                    fontWeight: "700",
                }}
            >
                {label}
            </Text>
        </View>
    );
};

export default PortalBadge;