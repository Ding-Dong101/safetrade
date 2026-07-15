import PortalTabs from "@/components/navigation/PortalTabs";

export default function BuyerLayout() {
    return (
        <PortalTabs
            tabs={[
                { name: "home", title: "Home", icon: "home" },
                { name: "accept", title: "Accept Trade", icon: "download" },
                { name: "messages", title: "Messages", icon: "chatbox-ellipses" },
                { name: "settings", title: "Settings", icon: "settings" },
            ]}
        />
    );
}
