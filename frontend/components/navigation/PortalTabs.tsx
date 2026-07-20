import { useMemo, useRef } from "react";
import { Tabs, useRouter, usePathname } from "expo-router";
import { View, PanResponder } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useRoleStore } from "@/store/roleStore";
import { Role } from "@/types/auth";

export interface PortalTab {
    name: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
}

interface PortalTabsProps {
    tabs: PortalTab[];
    role?: Role;
}

// Portal order used for edge swipes: swiping past the first/last tab moves to
// the neighbouring portal's home screen.
const PORTAL_ORDER: Role[] = ["buyer", "seller", "rider", "post"];

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

const PortalTabs = ({ tabs, role }: PortalTabsProps) => {
    const insets = useSafeAreaInsets();
    const { colors, components } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const setRole = useRoleStore((state) => state.setRole);
    const tabBar = components.tabBar;

    // Keep the latest values available to the PanResponder without recreating it.
    const swipeContext = useRef({ pathname, tabs, role });
    swipeContext.current = { pathname, tabs, role };

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponderCapture: (_evt, gesture) =>
                    Math.abs(gesture.dx) > 24 &&
                    Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
                onPanResponderRelease: (_evt, gesture) => {
                    if (Math.abs(gesture.dx) < 50) return;

                    const { pathname, tabs, role } = swipeContext.current;
                    const segment = pathname.split("/").filter(Boolean).pop() ?? "";
                    const currentIndex = tabs.findIndex(
                        (tab) => tab.name === segment
                    );
                    if (currentIndex === -1) return;

                    // Swipe left-to-right (dx > 0) goes back; right-to-left forward.
                    const direction = gesture.dx > 0 ? -1 : 1;
                    const nextIndex = currentIndex + direction;

                    if (nextIndex >= 0 && nextIndex < tabs.length) {
                        router.navigate(`/(${role})/${tabs[nextIndex].name}` as any);
                        return;
                    }

                    // Past the edge: jump to the neighbouring portal's home.
                    if (!role) return;
                    const portalIndex = PORTAL_ORDER.indexOf(role);
                    const nextPortal = PORTAL_ORDER[portalIndex + direction];
                    if (!nextPortal) return;

                    setRole(nextPortal);
                    router.replace(`/(${nextPortal})/home` as any);
                },
            }),
        [router, setRole]
    );

    return (
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
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
        </View>
    );
};

export default PortalTabs;
