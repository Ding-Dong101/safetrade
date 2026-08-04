package com.safetrade.safetradebackend.service;

import com.safetrade.safetradebackend.model.LinkPreviewResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class LinkPreviewServiceTest {

    private final LinkPreviewService service = new LinkPreviewService();

    @Test
    public void testEmptyUrlReturnsError() {
        LinkPreviewResponse response = service.extractPreview("");
        assertFalse(response.isSuccess());
        assertNotNull(response.getErrorMessage());
    }

    @Test
    public void testPlatformIdentification() {
        LinkPreviewResponse jiji = service.extractPreview("https://jiji.com.gh/item/macbook-pro-14-12345");
        assertEquals("Jiji Ghana", jiji.getPlatform());
        assertEquals("jiji.com.gh", jiji.getDomain());
        assertEquals("GHS", jiji.getCurrency());

        LinkPreviewResponse tonaton = service.extractPreview("https://tonaton.com/a_toyota-corolla-2015-accra-123.html");
        assertEquals("Tonaton", tonaton.getPlatform());
        assertEquals("tonaton.com", tonaton.getDomain());
        assertEquals("GHS", tonaton.getCurrency());

        LinkPreviewResponse fb = service.extractPreview("https://www.facebook.com/marketplace/item/987654321");
        assertEquals("Facebook Marketplace", fb.getPlatform());
        assertEquals("facebook.com", fb.getDomain());
        assertEquals("GHS", fb.getCurrency());
    }

    @Test
    public void testNonGhanaJijiRejected() {
        LinkPreviewResponse jijiNg = service.extractPreview("https://jiji.ng/item/iphone-123");
        assertFalse(jijiNg.isSuccess());
        assertTrue(jijiNg.getErrorMessage().contains("SafeTrade operates in Ghana"));
    }
}
