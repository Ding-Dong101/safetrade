/**
 * Resolves a high-quality representative product image from the web based on product title / keywords.
 */
export const getRepresentativeOnlineImage = (title: string): string => {
    if (!title || !title.trim()) {
        return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80";
    }

    const lower = title.toLowerCase();

    // 1. Graphics Cards & GPUs (Nvidia, Quadro, RTX, GTX, Radeon, Graphics Card, GDDR)
    if (lower.includes("quadro") || lower.includes("nvidia") || lower.includes("geforce") || lower.includes("rtx") || lower.includes("gtx") || lower.includes("graphics card") || lower.includes("video card") || lower.includes("gpu") || lower.includes("radeon") || lower.includes("gddr")) {
        return "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80";
    }

    // 2. Processors & CPUs (Intel Core, AMD Ryzen, CPU)
    if (lower.includes("intel") || lower.includes("core i7") || lower.includes("core i9") || lower.includes("core i5") || lower.includes("ryzen") || lower.includes("processor") || lower.includes("cpu")) {
        return "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80";
    }

    // 3. Motherboards & PC Components (Motherboard, RAM, SSD, Power Supply, Gaming PC)
    if (lower.includes("motherboard") || lower.includes("mainboard") || lower.includes("lga") || lower.includes("am4") || lower.includes("am5")) {
        return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80";
    }
    if (lower.includes("ram ") || lower.includes("ddr4") || lower.includes("ddr5") || lower.includes("corsair") || lower.includes("memory stick")) {
        return "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80";
    }
    if (lower.includes("ssd") || lower.includes("nvme") || lower.includes("hard drive") || lower.includes("hdd") || lower.includes("m.2") || lower.includes("sata")) {
        return "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80";
    }
    if (lower.includes("desktop") || lower.includes("pc tower") || lower.includes("workstation") || lower.includes("gaming pc") || lower.includes("rig")) {
        return "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80";
    }
    if (lower.includes("keyboard") || lower.includes("mouse") || lower.includes("mechanical keyboard")) {
        return "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80";
    }

    // 4. Phones & Apple Devices
    if (lower.includes("iphone") || lower.includes("apple phone") || lower.includes("promax") || lower.includes("pro max")) {
        return "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80";
    }
    if (lower.includes("samsung") || lower.includes("galaxy") || lower.includes("ultra") || lower.includes("z flip") || lower.includes("z fold")) {
        return "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80";
    }
    if (lower.includes("phone") || lower.includes("infinix") || lower.includes("tecno") || lower.includes("xiaomi") || lower.includes("redmi") || lower.includes("pixel")) {
        return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80";
    }

    // 5. Computers & Laptops
    if (lower.includes("macbook") || lower.includes("mac book") || lower.includes("imac")) {
        return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80";
    }
    if (lower.includes("laptop") || lower.includes("dell") || lower.includes("hp ") || lower.includes("lenovo") || lower.includes("thinkpad") || lower.includes("asus") || lower.includes("acer") || lower.includes("computer")) {
        return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80";
    }
    if (lower.includes("ipad") || lower.includes("tablet") || lower.includes("tab")) {
        return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80";
    }

    // 6. Gaming Consoles
    if (lower.includes("playstation") || lower.includes("ps5") || lower.includes("ps4")) {
        return "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80";
    }
    if (lower.includes("xbox") || lower.includes("nintendo") || lower.includes("gaming") || lower.includes("console")) {
        return "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80";
    }

    // 7. Watches & Audio
    if (lower.includes("watch") || lower.includes("rolex") || lower.includes("smartwatch") || lower.includes("apple watch")) {
        return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";
    }
    if (lower.includes("airpod") || lower.includes("headphone") || lower.includes("earbud") || lower.includes("speaker") || lower.includes("audio") || lower.includes("jbl")) {
        return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";
    }

    // 8. Cameras & TVs
    if (lower.includes("tv") || lower.includes("television") || lower.includes("monitor") || lower.includes("screen") || lower.includes("oled") || lower.includes("qled")) {
        return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80";
    }
    if (lower.includes("camera") || lower.includes("canon") || lower.includes("nikon") || lower.includes("sony") || lower.includes("lens")) {
        return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80";
    }

    // 9. Vehicles & Motors
    if (lower.includes("toyota") || lower.includes("corolla") || lower.includes("camry") || lower.includes("honda") || lower.includes("benz") || lower.includes("mercedes") || lower.includes("hyundai") || lower.includes("car ") || lower.includes("vehicle")) {
        return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80";
    }
    if (lower.includes("motor") || lower.includes("bike") || lower.includes("motorbike") || lower.includes("scooter") || lower.includes("yamaha")) {
        return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80";
    }

    // 10. Shoes & Fashion
    if (lower.includes("sneaker") || lower.includes("shoe") || lower.includes("nike") || lower.includes("jordan") || lower.includes("adidas") || lower.includes("yeezy")) {
        return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80";
    }
    if (lower.includes("bag") || lower.includes("handbag") || lower.includes("backpack") || lower.includes("purse")) {
        return "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80";
    }
    if (lower.includes("shirt") || lower.includes("dress") || lower.includes("suit") || lower.includes("cloth") || lower.includes("jacket") || lower.includes("hoodie")) {
        return "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80";
    }

    // 11. Home Appliances & Furniture
    if (lower.includes("fridge") || lower.includes("refrigerator") || lower.includes("ac") || lower.includes("conditioner") || lower.includes("blender") || lower.includes("microwave") || lower.includes("washing machine")) {
        return "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80";
    }
    if (lower.includes("sofa") || lower.includes("couch") || lower.includes("chair") || lower.includes("table") || lower.includes("desk") || lower.includes("bed") || lower.includes("furniture")) {
        return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80";
    }
    if (lower.includes("generator") || lower.includes("plant") || lower.includes("tool") || lower.includes("machine")) {
        return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80";
    }
    if (lower.includes("ring") || lower.includes("necklace") || lower.includes("jewelry") || lower.includes("gold") || lower.includes("diamond") || lower.includes("chain")) {
        return "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80";
    }

    // Default general product showcase
    return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80";
};
