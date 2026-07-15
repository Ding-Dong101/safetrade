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
    const { colors, components } = useTheme();
    const frame = components.tabBar.iconFrame;

    return (
        <View
            style={{
                alignItems: "center",
                justifyContent: "center",
                width: frame,
                height: frame,
                borderRadius: frame / 2,
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
                    bottom: insets.bottom > 0 ? insets.bottom : 12,
                    marginHorizontal: tabBar.horizontalInset,
                    height: tabBar.height,
                    borderRadius: tabBar.radius,
                    backgroundColor: colors.card,
                    borderTopWidth: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    // Kill the safe-area padding the navigator injects into the
                    // bar — it pushes icons off-center in a fixed-height pill.
                    paddingBottom: 0,
                    paddingTop: 0,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                },
                tabBarItemStyle: {
                    height: tabBar.height,
                    paddingVertical: 0,
                    justifyContent: "center",
                    alignItems: "center",
                },
                tabBarIconStyle: {
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
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
