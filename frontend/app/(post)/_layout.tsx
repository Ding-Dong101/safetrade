import PortalTabs from "@/components/navigation/PortalTabs";

export default function PostLayout() {
    return (
        <PortalTabs
            role="post"
            tabs={[
                { name: "home", title: "Home", icon: "home" },
                { name: "settings", title: "Settings", icon: "settings" },
            ]}
        />
    );
}
