import PortalTabs from "@/components/navigation/PortalTabs";

export default function BuyerLayout() {
    return (
        <PortalTabs
            role="buyer"
            tabs={[
                { name: "home", title: "Home", icon: "home" },
                { name: "marketplace", title: "Explore", icon: "storefront" },
                { name: "accept", title: "Accept Trade", icon: "download" },
                { name: "messages", title: "Messages", icon: "chatbox-ellipses" },
                { name: "settings", title: "Settings", icon: "settings" },
            ]}
        />
    );
}
