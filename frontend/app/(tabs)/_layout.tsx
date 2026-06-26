import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, components } from "@/constants/theme";
import { tabs } from "@/constants/data";
import { Ionicons } from "@expo/vector-icons";

const tabBar = components.tabBar;

const TabIcon = ({
    focused,
    name,
}: {
    focused: boolean;
    name: keyof typeof Ionicons.glyphMap;
}) => {
    return (
        <View
            style={{
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: focused
                    ? colors.primary + "20"
                    : "transparent",
            }}
        >
            <Ionicons
                name={name}
                size={22}
                color={focused ? colors.primary : colors.muted}
            />
        </View>
    );
};

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
    headerShown: false,
    tabBarShowLabel: false,
    tabBarStyle: {
      position: "absolute",
      bottom: insets.bottom > 0 ? 14: 8,
      marginHorizontal: tabBar.horizontalInset,
      height: tabBar.height,
      borderRadius: tabBar.radius,
      backgroundColor: colors.card,
      borderTopWidth: 0,
      borderColor: colors.border,
      elevation: 0
       },   
       tabBarItemStyle:{
                 paddingVertical: tabBar.height/ 2 - tabBar
                     .iconFrame /1.7
             },

              tabBarIconStyle:{
                 width:tabBar.iconFrame,
                 height:tabBar.iconFrame,
                 alignItems: 'center',
             }


            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} name="home" />
                    ),
                }}
            />
            <Tabs.Screen
                name="new"
                options={{
                    title: "New",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} name="add-circle" />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} name="time" />
                    ),
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: "Alerts",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} name="notifications" />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} name="person" />
                    ),
                }}
            />
        </Tabs>
    );
}