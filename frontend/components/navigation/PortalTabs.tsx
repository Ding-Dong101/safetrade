import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

export interface PortalTab {
    name: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
}

interface PortalTabsProps {
    tabs: PortalTab[];
}

const TabIcon = ({
    focused,
    name,
}: {
    focused: boolean;
    name: keyof typeof Ionicons.glyphMap;
}) => {
    const { colors } = useTheme();

    return (
        <View
            style={{
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: focused ? colors.primary + "20" : "transparent",
            }}
        >
            <Ionicons
                name={name}
                size={26}
                color={focused ? colors.primary : colors.muted}
            />
        </View>
    );
};

const PortalTabs = ({ tabs }: PortalTabsProps) => {
    const insets = useSafeAreaInsets();
    const { colors, components } = useTheme();
    const tabBar = components.tabBar;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                sceneStyle: { backgroundColor: colors.background },
                tabBarStyle: {
                    position: "absolute",
                    bottom: insets.bottom > 0 ? 14 : 8,
                    marginHorizontal: tabBar.horizontalInset,
                    height: tabBar.height,
                    borderRadius: tabBar.radius,
                    backgroundColor: colors.card,
                    borderTopWidth: 0,
                    borderColor: colors.border,
                    elevation: 0,
                },
                tabBarItemStyle: {
                    height: tabBar.height,
                    justifyContent: "center",
                    alignItems: "center",
                },
            }}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} name={tab.icon} />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
};

export default PortalTabs;
