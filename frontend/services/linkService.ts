import { getRepresentativeOnlineImage } from "@/utils/imageLookup";
import { useAuthStore } from "@/store/authStore";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://safetrade-or1w.onrender.com/api";

export interface LinkPreviewData {
    url: string;
    title: string;
    description: string;
    image: string | null;
    price: number | null;
    listedPrice?: number | null;
    sellerContact?: string | null;
    sellerLocation?: string | null;
    attributes?: Record<string, string>;
    currency: string;
    platform: string;
    domain: string;
    isSuccess: boolean;
    errorMessage?: string;
}

export const identifyPlatform = (url: string): { platform: string; domain: string } => {
    let domain = "marketplace";
    try {
        const clean = url.startsWith("http") ? url : `https://${url}`;
        const parts = clean.split("/")[2] || "";
        domain = parts.replace(/^www\./, "");
    } catch {}

    const lower = (domain + " " + url).toLowerCase();
    if (lower.includes("jiji.com.gh")) {
        return { platform: "Jiji Ghana", domain };
    }
    if (lower.includes("jiji.")) {
        return { platform: "Jiji", domain };
    }
    if (lower.includes("tonaton.com") || lower.includes("tonaton.")) {
        return { platform: "Tonaton", domain };
    }
    if (lower.includes("facebook.com") || lower.includes("fb.com") || lower.includes("fb.watch")) {
        return { platform: "Facebook Marketplace", domain };
    }
    return { platform: "Marketplace Listing", domain };
};

const extractTitleFromUrl = (url: string, platform: string): string => {
    try {
        const clean = url.split("?")[0].split("#")[0];
        const segments = clean.split("/").filter(Boolean);
        const lastSegment = segments[segments.length - 1] || "";
        if (lastSegment && lastSegment.length > 2 && !/^[0-9a-fA-F-]{12,}$/.test(lastSegment)) {
            const words = lastSegment
                .replace(/[-_+]/g, " ")
                .replace(/\.(html|php|asp|htm)$/i, "")
                .split(" ")
                .filter((w) => w.length > 0)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
            if (words.length >= 3 && !words.toLowerCase().includes("index")) {
                return words;
            }
        }
    } catch {}
    return `Item on ${platform}`;
};

const cleanImageUrl = (rawUrl: string | null | undefined, domain: string): string | null => {
    if (!rawUrl) return null;
    let clean = rawUrl
        .replace(/&amp;/g, "&")
        .replace(/&#x2F;/g, "/")
        .replace(/\\\/|\//g, "/")
        .replace(/^"|"$/g, "")
        .trim();

    if (clean.startsWith("//")) {
        clean = "https:" + clean;
    } else if (clean.startsWith("/")) {
        clean = "https://" + domain + clean;
    }

    if (!clean.startsWith("http")) return null;

    const lower = clean.toLowerCase();
    if (
        lower.includes("jiji-preview.png") ||
        lower.includes("fb_icon_325x325") ||
        lower.includes("favicon") ||
        lower.includes("default_avatar") ||
        lower.includes("1x1.png")
    ) {
        return null;
    }
    return clean;
};

/**
 * Parses product metadata from Jiji Ghana, Facebook Marketplace, and Tonaton.
 */
export const parseLink = async (inputUrl: string): Promise<LinkPreviewData> => {
    let cleanUrl = inputUrl.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = "https://" + cleanUrl;
    }

    const { platform, domain } = identifyPlatform(cleanUrl);
    const lowerUrl = cleanUrl.toLowerCase();

    // Ghana validation for Jiji
    if ((domain.includes("jiji") || lowerUrl.includes("jiji.")) && !domain.includes("jiji.com.gh") && !lowerUrl.includes("jiji.com.gh")) {
        throw new Error("SafeTrade operates in Ghana. Please use listings from Jiji Ghana (jiji.com.gh).");
    }

    // 1. Try Direct Client Scraping First
    try {
        const res = await fetch(cleanUrl, {
            method: "GET",
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            },
        });

        if (res.ok) {
            const html = await res.text();

            // Extract Title
            const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
                || html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i)
                || html.match(/<title[^>]*>([^<]+)<\/title>/i);

            // Extract Description
            const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
                || html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

            // Extract Image via JSON-LD or meta tags or img tags
            const jsonLdImgMatch = html.match(/"image"\s*:\s*(?:\[\s*"([^"]+)"|"([^"]+)")/i);
            const ogImageMatch = html.match(/<meta[^>]*property=["'](?:og:image:secure_url|og:image)["'][^>]*content=["']([^"']+)["']/i)
                || html.match(/<meta[^>]*name=["'](?:twitter:image:src|twitter:image)["'][^>]*content=["']([^"']+)["']/i)
                || html.match(/<link[^>]*rel=["'](?:image_src|apple-touch-icon-precomposed)["'][^>]*href=["']([^"']+)["']/i)
                || html.match(/<img[^>]*(?:data-src|src)=["']([^"']*(?:jiji|tonaton|fbcdn|cloudinary)[^"']*)["']/i);

            const title = ogTitleMatch ? ogTitleMatch[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim() : extractTitleFromUrl(cleanUrl, platform);
            const description = ogDescMatch ? ogDescMatch[1].replace(/&amp;/g, "&").trim() : "";

            const rawImg = jsonLdImgMatch ? (jsonLdImgMatch[1] || jsonLdImgMatch[2]) : (ogImageMatch ? ogImageMatch[1] : null);
            const image = cleanImageUrl(rawImg, domain) || getRepresentativeOnlineImage(title);

            // Extract Price
            const priceMatch = html.match(/(?:GH[₵c]|GHS|Cedis|₵)\s*([0-9,]+(?:\.[0-9]{2})?)/i)
                || html.match(/"price"\s*:\s*"?([0-9.]+)"?/i);

            // Extract Contact
            const phoneMatch = html.match(/(?:(?:\+233|0)[235][0-9]{8})/);

            // Extract Specific Location: e.g. Greater Accra, Spintex
            const locRegex = /(Greater Accra|Ashanti|Central|Western|Eastern|Northern|Volta|Upper East|Upper West|Bono|Bono East|Ahafo|Oti|Savannah|North East|Western North),\s*([A-Za-z0-9\s-]+?)(?:,|\n|<|\s*\d+\s*(?:mins?|hours?|days?|ago)|$)/i;
            const locMatch = html.match(locRegex);
            let sellerLocation = "Greater Accra, Ghana";
            if (locMatch) {
                sellerLocation = `${locMatch[2].trim()}, ${locMatch[1].trim()}, Ghana`;
            } else {
                const townMatch = html.match(/\b(Spintex|East Legon|Osu|Madina|Tema|Dansoman|Lapaz|Cantonments|Kasoa|Adabraka|Achimota|Dome|Dzorwulu|Roman Ridge|Ridge|Labone|Airport Residential|Teshie|Nungua|Adenta|Abeka|Ashaiman|Kumasi|Adum|Bantama|Tafo|Ahodwo|Asokwa|KNUST|Takoradi|Cape Coast|Tamale|Sunyani|Koforidua|Ho)\b/i);
                if (townMatch) {
                    sellerLocation = `${townMatch[0]}, Ghana`;
                }
            }

            // Extract Key Specs Attributes from JSON-LD / HTML
            const attributes: Record<string, string> = {};
            const propRegex = /"name"\s*:\s*"([^"]+)"\s*,\s*"value"\s*:\s*"([^"]+)"/gi;
            let propMatch;
            while ((propMatch = propRegex.exec(html)) !== null) {
                const k = propMatch[1].trim();
                const v = propMatch[2].trim();
                if (k.toLowerCase() !== "type" || v.toLowerCase() !== "propertyvalue") {
                    attributes[k] = v;
                }
            }

            const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : null;
            const sellerContact = phoneMatch ? phoneMatch[0] : null;

            if (title || price || image) {
                return {
                    url: cleanUrl,
                    title: title || `Item on ${platform}`,
                    description: description || `Listing on ${platform}`,
                    image,
                    price: price && !isNaN(price) ? price : null,
                    listedPrice: price && !isNaN(price) ? price : null,
                    sellerContact,
                    sellerLocation,
                    attributes,
                    currency: "GHS",
                    platform,
                    domain,
                    isSuccess: true,
                };
            }
        }
    } catch (clientErr) {
        // Fall through to backend or URL extraction
    }

    // 2. Try Backend Scraper (Silent probe)
    try {
        const token = useAuthStore.getState().token;
        const resp = await fetch(`${BASE_URL}/link-preview/parse`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ url: cleanUrl }),
        });

        if (resp.ok) {
            const data: LinkPreviewData = await resp.json();
            if (data && (data.title || data.image || data.price)) {
                const resolvedImg = cleanImageUrl(data.image, domain) || getRepresentativeOnlineImage(data.title);
                return {
                    ...data,
                    image: resolvedImg,
                    sellerLocation: data.sellerLocation || "Greater Accra, Ghana",
                    currency: "GHS",
                    platform: data.platform || platform,
                    attributes: data.attributes || {},
                };
            }
        }
    } catch (backendErr) {
        // Backend offline or route pending deployment
    }

    // 3. Fallback extraction
    const derivedTitle = extractTitleFromUrl(cleanUrl, platform);
    return {
        url: cleanUrl,
        title: derivedTitle,
        description: `Listing from ${domain} in Ghana. Verify details to create escrow.`,
        image: getRepresentativeOnlineImage(derivedTitle),
        price: null,
        listedPrice: null,
        sellerContact: null,
        sellerLocation: "Greater Accra, Ghana",
        attributes: {},
        currency: "GHS",
        platform,
        domain,
        isSuccess: true,
    };
};
