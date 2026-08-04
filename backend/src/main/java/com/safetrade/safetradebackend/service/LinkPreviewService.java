package com.safetrade.safetradebackend.service;

import com.safetrade.safetradebackend.model.LinkPreviewResponse;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LinkPreviewService {

    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    private static final int TIMEOUT_MS = 7000;

    private static final Pattern PRICE_PATTERN = Pattern.compile("(?:GH[₵c]|GHS|Cedis|₵|₦|NGN|USD|\\$)?\\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\\.[0-9]{2})?|[0-9]+)\\s*(?:GHS|GH[₵c]|Cedis|naira)?", Pattern.CASE_INSENSITIVE);
    private static final Pattern JSON_PRICE_PATTERN = Pattern.compile("\"price\"\\s*:\\s*[\"']?([0-9]+(?:\\.[0-9]+)?)[\"']?", Pattern.CASE_INSENSITIVE);
    private static final Pattern JSON_IMAGE_PATTERN = Pattern.compile("\"image\"\\s*:\\s*(?:\\[\\s*\"([^\"]+)\"|\"([^\"]+)\")", Pattern.CASE_INSENSITIVE);
    private static final Pattern PHONE_PATTERN = Pattern.compile("(?:(?:\\+233|0)[235][0-9]{8})");

    private static final Pattern REGION_LOCALITY_PATTERN = Pattern.compile("(Greater Accra|Ashanti|Central|Western|Eastern|Northern|Volta|Upper East|Upper West|Bono|Bono East|Ahafo|Oti|Savannah|North East|Western North),\\s*([A-Za-z0-9\\s-]+?)(?:,|\n|\\s*\\d+\\s*(?:mins?|hours?|days?|ago|weeks?)|$)", Pattern.CASE_INSENSITIVE);
    private static final Pattern GHANA_TOWNS_PATTERN = Pattern.compile("\\b(Spintex|East Legon|Osu|Madina|Tema|Dansoman|Lapaz|Cantonments|Kasoa|Adabraka|Achimota|Dome|Dzorwulu|Roman Ridge|Ridge|Labone|Airport Residential|Teshie|Nungua|Adenta|Abeka|Ashaiman|Kumasi|Adum|Bantama|Tafo|Ahodwo|Asokwa|KNUST|Takoradi|Cape Coast|Tamale|Sunyani|Koforidua|Ho)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern GHANA_REGIONS_PATTERN = Pattern.compile("\\b(Greater Accra|Ashanti|Central|Western|Eastern|Northern|Volta|Upper East|Upper West|Bono|Bono East|Ahafo|Oti|Savannah|North East|Western North)\\b", Pattern.CASE_INSENSITIVE);

    public LinkPreviewResponse extractPreview(String inputUrl) {
        if (inputUrl == null || inputUrl.trim().isEmpty()) {
            return LinkPreviewResponse.builder()
                    .isSuccess(false)
                    .errorMessage("URL cannot be empty")
                    .build();
        }

        String url = inputUrl.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }

        String domain = extractDomain(url);
        String lowerUrl = url.toLowerCase();

        // Enforce Ghana-only for Jiji
        if ((domain.contains("jiji") || lowerUrl.contains("jiji.")) && !domain.contains("jiji.com.gh") && !lowerUrl.contains("jiji.com.gh")) {
            return LinkPreviewResponse.builder()
                    .url(url)
                    .platform("Jiji")
                    .domain(domain)
                    .isSuccess(false)
                    .errorMessage("SafeTrade operates in Ghana. Please use listings from Jiji Ghana (jiji.com.gh).")
                    .build();
        }

        String platform = identifyPlatform(domain, url);

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent(USER_AGENT)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
                    .ignoreHttpErrors(true)
                    .get();

            String title = extractMeta(doc, "og:title", "twitter:title", "title");
            if (title == null || title.isBlank()) {
                title = doc.title();
            }
            if (title == null || title.isBlank()) {
                title = "Item on " + platform;
            } else {
                title = cleanTitle(title, platform);
            }

            String description = extractDescription(doc);
            String image = extractImage(doc, domain);
            if (image == null || image.isBlank()) {
                image = getRepresentativeOnlineImage(title);
            }

            Double price = extractPrice(doc);
            String sellerContact = extractSellerContact(doc);
            String sellerLocation = extractSellerLocation(doc);
            Map<String, String> attributes = extractAttributes(doc, description);

            return LinkPreviewResponse.builder()
                    .url(url)
                    .title(title)
                    .description(description != null ? description : "")
                    .image(image)
                    .price(price)
                    .listedPrice(price)
                    .sellerContact(sellerContact)
                    .sellerLocation(sellerLocation != null ? sellerLocation : "Ghana")
                    .attributes(attributes)
                    .currency("GHS")
                    .platform(platform)
                    .domain(domain)
                    .isSuccess(true)
                    .build();

        } catch (Exception e) {
            String derivedTitle = extractTitleFromUrl(url, platform);
            String fallbackImage = getRepresentativeOnlineImage(derivedTitle);

            return LinkPreviewResponse.builder()
                    .url(url)
                    .title(derivedTitle)
                    .description("Listing from " + domain + " in Ghana. Enter agreed price and details to secure trade.")
                    .image(fallbackImage)
                    .price(null)
                    .listedPrice(null)
                    .sellerContact(null)
                    .sellerLocation("Ghana")
                    .attributes(new LinkedHashMap<>())
                    .currency("GHS")
                    .platform(platform)
                    .domain(domain)
                    .isSuccess(true)
                    .errorMessage("Metadata partially fetched: " + e.getMessage())
                    .build();
        }
    }

    private String extractDescription(Document doc) {
        String description = extractMeta(doc, "og:description", "twitter:description", "description");
        Element descEl = doc.selectFirst(".qa-advert-description, .advert-description, .description-content, .b-advert-description, .qa-advert-text, .b-advert-text");
        if (descEl != null && !descEl.text().isBlank()) {
            description = descEl.text();
        }
        if (description != null) {
            description = description.trim();
        }
        return description;
    }

    private Map<String, String> extractAttributes(Document doc, String description) {
        Map<String, String> attributes = new LinkedHashMap<>();

        try {
            // 1. Jiji DOM structured attribute elements: .b-advert-attribute or .b-advert-attributes__item
            Elements attrElements = doc.select(".b-advert-attribute, .b-advert-attributes__item, .qa-advert-attribute, .b-advert-specs__item, .advert-attribute");
            for (Element el : attrElements) {
                Element keyEl = el.selectFirst(".b-advert-attribute__key, .qa-advert-attribute-key, .b-advert-specs__name, .name, .key, .label");
                Element valEl = el.selectFirst(".b-advert-attribute__value, .qa-advert-attribute-val, .b-advert-specs__value, .value");
                if (keyEl != null && valEl != null) {
                    String k = keyEl.text().trim();
                    String v = valEl.text().trim();
                    if (!k.isEmpty() && !v.isEmpty() && k.length() < 40 && v.length() < 60) {
                        attributes.put(k, v);
                    }
                }
            }

            // 2. JSON-LD additionalProperty or product properties
            for (Element script : doc.select("script[type=application/ld+json]")) {
                String json = script.html();
                // Match "name": "Brand", "value": "PNY"
                Pattern propPattern = Pattern.compile("\"name\"\\s*:\\s*\"([^\"]+)\"\\s*,\\s*\"value\"\\s*:\\s*\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);
                Matcher m = propPattern.matcher(json);
                while (m.find()) {
                    String k = m.group(1).trim();
                    String v = m.group(2).trim();
                    if (!k.equalsIgnoreCase("type") || !v.equalsIgnoreCase("PropertyValue")) {
                        attributes.putIfAbsent(k, v);
                    }
                }
                // Match brand: {"name": "..."}
                Matcher brandMatcher = Pattern.compile("\"brand\"\\s*:\\s*(?:\\{\\s*\"name\"\\s*:\\s*\"([^\"]+)\"|\"([^\"]+)\")", Pattern.CASE_INSENSITIVE).matcher(json);
                if (brandMatcher.find()) {
                    String brand = brandMatcher.group(1) != null ? brandMatcher.group(1) : brandMatcher.group(2);
                    attributes.putIfAbsent("Brand", brand.trim());
                }
                // Match model
                Matcher modelMatcher = Pattern.compile("\"model\"\\s*:\\s*\"([^\"]+)\"", Pattern.CASE_INSENSITIVE).matcher(json);
                if (modelMatcher.find()) {
                    attributes.putIfAbsent("Model", modelMatcher.group(1).trim());
                }
            }

            // 3. Fallback: Parse common spec patterns from description text if attributes empty
            if (attributes.isEmpty() && description != null) {
                String[] lines = description.split("\n");
                for (String line : lines) {
                    if (line.contains(":") && line.length() < 80) {
                        String[] parts = line.split(":", 2);
                        String k = parts[0].replaceAll("^[^a-zA-Z0-9]+", "").trim();
                        String v = parts[1].trim();
                        if (k.length() >= 3 && k.length() <= 25 && v.length() >= 1 && v.length() <= 50) {
                            if (!k.equalsIgnoreCase("http") && !k.equalsIgnoreCase("https")) {
                                attributes.put(k, v);
                            }
                        }
                    }
                }
            }
        } catch (Exception ignored) {}

        return attributes;
    }

    private String extractSellerLocation(Document doc) {
        try {
            // 1. Look for Jiji location elements
            Element locEl = doc.selectFirst(".b-advert-location, .qa-advert-region, .b-advert-location-wrapper, [itemprop=address], .qa-advert-location, .b-advert-info-item--location");
            if (locEl != null && !locEl.text().isBlank()) {
                String locText = locEl.text().trim();
                locText = locText.replaceAll("(?i)\\s*\\d+\\s*(?:mins?|hours?|days?|ago|weeks?).*$", "").trim();
                Matcher m = REGION_LOCALITY_PATTERN.matcher(locText);
                if (m.find()) {
                    String region = m.group(1).trim();
                    String locality = m.group(2).trim();
                    return locality + ", " + region + ", Ghana";
                }
                if (!locText.isEmpty()) {
                    return locText.contains("Ghana") ? locText : locText + ", Ghana";
                }
            }

            // 2. Full text region + town regex search
            String docText = doc.text();
            Matcher regionLocMatcher = REGION_LOCALITY_PATTERN.matcher(docText);
            if (regionLocMatcher.find()) {
                String region = regionLocMatcher.group(1).trim();
                String locality = regionLocMatcher.group(2).trim();
                if (locality.length() < 30) {
                    return locality + ", " + region + ", Ghana";
                }
            }

            // 3. Match town and region separately
            Matcher townM = GHANA_TOWNS_PATTERN.matcher(docText);
            Matcher regionM = GHANA_REGIONS_PATTERN.matcher(docText);

            if (townM.find() && regionM.find()) {
                return townM.group(0) + ", " + regionM.group(0) + ", Ghana";
            } else if (townM.find()) {
                return townM.group(0) + ", Ghana";
            } else if (regionM.find()) {
                return regionM.group(0) + ", Ghana";
            }
        } catch (Exception ignored) {}

        return "Greater Accra, Ghana";
    }

    public String getRepresentativeOnlineImage(String title) {
        if (title == null || title.isBlank()) {
            return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80";
        }
        String lower = title.toLowerCase();

        // 1. Graphics Cards & GPUs (Nvidia, Quadro, RTX, GTX, Radeon, Graphics Card)
        if (lower.contains("quadro") || lower.contains("nvidia") || lower.contains("geforce") || lower.contains("rtx") || lower.contains("gtx") || lower.contains("graphics card") || lower.contains("video card") || lower.contains("gpu") || lower.contains("radeon") || lower.contains("gddr")) {
            return "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80";
        }

        // 2. Processors & CPUs (Intel Core, AMD Ryzen, CPU)
        if (lower.contains("intel") || lower.contains("core i7") || lower.contains("core i9") || lower.contains("core i5") || lower.contains("ryzen") || lower.contains("processor") || lower.contains("cpu")) {
            return "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80";
        }

        // 3. Motherboards & PC Components (Motherboard, RAM, SSD, Power Supply)
        if (lower.contains("motherboard") || lower.contains("mainboard") || lower.contains("lga") || lower.contains("am4") || lower.contains("am5")) {
            return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80";
        }
        if (lower.contains("ram ") || lower.contains("ddr4") || lower.contains("ddr5") || lower.contains("corsair") || lower.contains("memory stick")) {
            return "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80";
        }
        if (lower.contains("ssd") || lower.contains("nvme") || lower.contains("hard drive") || lower.contains("hdd") || lower.contains("m.2") || lower.contains("sata")) {
            return "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80";
        }
        if (lower.contains("desktop") || lower.contains("pc tower") || lower.contains("workstation") || lower.contains("gaming pc") || lower.contains("rig")) {
            return "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80";
        }
        if (lower.contains("keyboard") || lower.contains("mouse") || lower.contains("mechanical keyboard")) {
            return "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80";
        }

        // 4. Phones & Apple Devices
        if (lower.contains("iphone") || lower.contains("apple phone") || lower.contains("promax") || lower.contains("pro max")) {
            return "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80";
        }
        if (lower.contains("samsung") || lower.contains("galaxy") || lower.contains("ultra") || lower.contains("z flip") || lower.contains("z fold")) {
            return "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80";
        }
        if (lower.contains("pixel") || lower.contains("infinix") || lower.contains("tecno") || lower.contains("xiaomi") || lower.contains("redmi") || lower.contains("phone")) {
            return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80";
        }

        // 5. Laptops & Computers
        if (lower.contains("macbook") || lower.contains("mac book") || lower.contains("imac")) {
            return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80";
        }
        if (lower.contains("laptop") || lower.contains("dell") || lower.contains("hp ") || lower.contains("lenovo") || lower.contains("thinkpad") || lower.contains("asus") || lower.contains("acer")) {
            return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80";
        }
        if (lower.contains("ipad") || lower.contains("tablet") || lower.contains("tab")) {
            return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80";
        }

        // 6. Gaming Consoles
        if (lower.contains("playstation") || lower.contains("ps5") || lower.contains("ps4")) {
            return "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80";
        }
        if (lower.contains("xbox") || lower.contains("nintendo") || lower.contains("gaming") || lower.contains("console")) {
            return "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80";
        }

        // 7. Watches & Audio
        if (lower.contains("watch") || lower.contains("rolex") || lower.contains("smartwatch") || lower.contains("apple watch")) {
            return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";
        }
        if (lower.contains("airpod") || lower.contains("headphone") || lower.contains("earbud") || lower.contains("speaker") || lower.contains("audio") || lower.contains("jbl")) {
            return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";
        }

        // 8. Cameras & TVs / Monitors
        if (lower.contains("tv") || lower.contains("television") || lower.contains("monitor") || lower.contains("screen") || lower.contains("oled") || lower.contains("qled")) {
            return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80";
        }
        if (lower.contains("camera") || lower.contains("canon") || lower.contains("nikon") || lower.contains("sony") || lower.contains("lens")) {
            return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80";
        }

        // 9. Vehicles & Motors
        if (lower.contains("toyota") || lower.contains("corolla") || lower.contains("camry") || lower.contains("honda") || lower.contains("benz") || lower.contains("mercedes") || lower.contains("hyundai") || lower.contains("car ") || lower.contains("vehicle")) {
            return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80";
        }
        if (lower.contains("motor") || lower.contains("bike") || lower.contains("motorbike") || lower.contains("scooter") || lower.contains("yamaha")) {
            return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80";
        }

        // 10. Shoes & Fashion
        if (lower.contains("sneaker") || lower.contains("shoe") || lower.contains("nike") || lower.contains("jordan") || lower.contains("adidas") || lower.contains("yeezy")) {
            return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80";
        }
        if (lower.contains("bag") || lower.contains("handbag") || lower.contains("backpack") || lower.contains("purse")) {
            return "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80";
        }
        if (lower.contains("shirt") || lower.contains("dress") || lower.contains("suit") || lower.contains("cloth") || lower.contains("jacket") || lower.contains("hoodie")) {
            return "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80";
        }

        // 11. Home Appliances & Furniture
        if (lower.contains("fridge") || lower.contains("refrigerator") || lower.contains("ac") || lower.contains("conditioner") || lower.contains("blender") || lower.contains("microwave") || lower.contains("washing machine")) {
            return "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80";
        }
        if (lower.contains("sofa") || lower.contains("couch") || lower.contains("chair") || lower.contains("table") || lower.contains("desk") || lower.contains("bed") || lower.contains("furniture")) {
            return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80";
        }
        if (lower.contains("generator") || lower.contains("plant") || lower.contains("tool") || lower.contains("machine")) {
            return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80";
        }
        if (lower.contains("ring") || lower.contains("necklace") || lower.contains("jewelry") || lower.contains("gold") || lower.contains("diamond") || lower.contains("chain")) {
            return "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80";
        }

        return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80";
    }

    private String extractImage(Document doc, String domain) {
        try {
            // 1. JSON-LD structured data
            for (Element script : doc.select("script[type=application/ld+json]")) {
                String json = script.html();
                Matcher matcher = JSON_IMAGE_PATTERN.matcher(json);
                if (matcher.find()) {
                    String img = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
                    String clean = cleanImageUrl(img, domain);
                    if (isValidProductImage(clean)) {
                        return clean;
                    }
                }
            }

            // 2. OpenGraph & Twitter Meta Tags
            String metaImage = extractMeta(doc, "og:image:secure_url", "og:image", "twitter:image:src", "twitter:image", "image");
            if (metaImage != null) {
                String clean = cleanImageUrl(metaImage, domain);
                if (isValidProductImage(clean)) {
                    return clean;
                }
            }

            // 3. Link image_src tag
            Element linkImage = doc.selectFirst("link[rel=image_src], link[rel=apple-touch-icon-precomposed]");
            if (linkImage != null) {
                String href = linkImage.attr("href");
                String clean = cleanImageUrl(href, domain);
                if (isValidProductImage(clean)) {
                    return clean;
                }
            }

            // 4. Jiji & Tonaton specific gallery / image tags
            Element imgEl = doc.selectFirst(".b-advert-gallery__image img, .qa-advert-image, img[data-src*='jiji'], img[src*='jiji'], img[src*='tonaton'], picture img, .gallery img");
            if (imgEl != null) {
                String src = imgEl.hasAttr("data-src") ? imgEl.attr("data-src") : imgEl.attr("src");
                String clean = cleanImageUrl(src, domain);
                if (isValidProductImage(clean)) {
                    return clean;
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String cleanImageUrl(String rawUrl, String domain) {
        if (rawUrl == null || rawUrl.isBlank()) return null;
        String clean = rawUrl.replace("&amp;", "&").replace("&#x2F;", "/").replace("\\/", "/").trim();
        if (clean.startsWith("//")) {
            clean = "https:" + clean;
        } else if (clean.startsWith("/")) {
            clean = "https://" + domain + clean;
        }
        return clean.startsWith("http") ? clean : null;
    }

    private boolean isValidProductImage(String url) {
        if (url == null || url.isBlank()) return false;
        String lower = url.toLowerCase();
        return !lower.contains("jiji-preview.png")
                && !lower.contains("fb_icon_325x325")
                && !lower.contains("favicon")
                && !lower.contains("default_avatar")
                && !lower.contains("logo-placeholder")
                && !lower.contains("1x1.png");
    }

    private String extractMeta(Document doc, String... metaKeys) {
        for (String key : metaKeys) {
            Element el = doc.selectFirst("meta[property=" + key + "]");
            if (el == null) {
                el = doc.selectFirst("meta[name=" + key + "]");
            }
            if (el != null) {
                String content = el.attr("content");
                if (content != null && !content.trim().isEmpty()) {
                    return content.trim();
                }
            }
        }
        return null;
    }

    private Double extractPrice(Document doc) {
        try {
            String priceStr = extractMeta(doc, "og:price:amount", "product:price:amount", "price");
            if (priceStr != null) {
                return parseNumericPrice(priceStr);
            }

            for (Element script : doc.select("script[type=application/ld+json]")) {
                String json = script.html();
                Matcher matcher = JSON_PRICE_PATTERN.matcher(json);
                if (matcher.find()) {
                    return parseNumericPrice(matcher.group(1));
                }
            }

            Element priceEl = doc.selectFirst(".price, [itemprop=price], .product-price, .current-price, .qa-advert-price, .listing-price");
            if (priceEl != null) {
                String text = priceEl.text();
                Matcher matcher = PRICE_PATTERN.matcher(text);
                if (matcher.find()) {
                    return parseNumericPrice(matcher.group(1));
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String extractSellerContact(Document doc) {
        try {
            Element contactEl = doc.selectFirst("[itemprop=telephone], .seller-phone, .contact-seller, .phone-number, [data-phone]");
            if (contactEl != null) {
                String phone = contactEl.attr("data-phone");
                if (phone == null || phone.isBlank()) {
                    phone = contactEl.text();
                }
                if (phone != null && !phone.isBlank()) {
                    return phone.trim();
                }
            }

            String bodyText = doc.text();
            Matcher matcher = PHONE_PATTERN.matcher(bodyText);
            if (matcher.find()) {
                return matcher.group(0);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private Double parseNumericPrice(String val) {
        if (val == null) return null;
        try {
            String cleaned = val.replaceAll("[^0-9.]", "").trim();
            if (!cleaned.isEmpty()) {
                double parsed = Double.parseDouble(cleaned);
                if (parsed > 0 && parsed < 1000000000) {
                    return parsed;
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String cleanTitle(String title, String platform) {
        if (title == null) return "";
        String cleaned = title.replaceAll("(?i)\\s*(\\||-|•|–)\\s*(Jiji|Tonaton|Facebook).*$", "").trim();
        return cleaned.isEmpty() ? title.trim() : cleaned;
    }

    private String extractTitleFromUrl(String url, String platform) {
        try {
            String clean = url.split("\\?")[0].split("#")[0];
            String[] segments = clean.split("/");
            for (int i = segments.length - 1; i >= 0; i--) {
                String seg = segments[i].trim();
                if (!seg.isEmpty() && !seg.matches("^[0-9a-fA-F-]{10,}$") && !seg.equalsIgnoreCase("item")) {
                    String words = seg.replaceAll("[-_+.]", " ").replaceAll("(?i)\\.(html|php|asp|htm)$", "").trim();
                    if (words.length() > 3) {
                        return words;
                    }
                }
            }
        } catch (Exception ignored) {}
        return "Listing on " + platform;
    }

    private String extractDomain(String urlString) {
        try {
            URI uri = new URI(urlString);
            String host = uri.getHost();
            if (host != null) {
                return host.startsWith("www.") ? host.substring(4) : host;
            }
        } catch (Exception ignored) {}
        return "marketplace";
    }

    public String identifyPlatform(String domain, String url) {
        String lower = (domain + " " + url).toLowerCase();
        if (lower.contains("jiji.com.gh")) {
            return "Jiji Ghana";
        }
        if (lower.contains("tonaton.com") || lower.contains("tonaton.")) {
            return "Tonaton";
        }
        if (lower.contains("facebook.com") || lower.contains("fb.com") || lower.contains("fb.watch")) {
            return "Facebook Marketplace";
        }
        return "Marketplace Listing";
    }
}
