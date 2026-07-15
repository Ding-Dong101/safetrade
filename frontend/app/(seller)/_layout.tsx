import PortalTabs from "@/components/navigation/PortalTabs";

export default function SellerLayout() {
    return (
        <PortalTabs
            tabs={[
                { name: "home", title: "Home", icon: "home" },
                { name: "create", title: "Create Trade", icon: "add-circle" },
                { name: "messages", title: "Messages", icon: "chatbox-ellipses" },
                { name: "settings", title: "Settings", icon: "settings" },
            ]}
        />
    );
}
