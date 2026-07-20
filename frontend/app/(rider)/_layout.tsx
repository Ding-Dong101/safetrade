import PortalTabs from "@/components/navigation/PortalTabs";

export default function RiderLayout() {
    return (
        <PortalTabs
            role="rider"
            tabs={[
                { name: "home", title: "Home", icon: "home" },
                { name: "messages", title: "Messages", icon: "chatbox-ellipses" },
                { name: "settings", title: "Settings", icon: "settings" },
            ]}
        />
    );
}
