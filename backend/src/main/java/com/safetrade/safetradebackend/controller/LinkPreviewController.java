package com.safetrade.safetradebackend.controller;

import com.safetrade.safetradebackend.model.LinkPreviewResponse;
import com.safetrade.safetradebackend.service.LinkPreviewService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping({"/api/v2/link-preview", "/api/link-preview"})
public class LinkPreviewController {

    private final LinkPreviewService linkPreviewService;

    public LinkPreviewController(LinkPreviewService linkPreviewService) {
        this.linkPreviewService = linkPreviewService;
    }

    @Data
    public static class ParseRequest {
        private String url;
    }

    @PostMapping("/parse")
    public ResponseEntity<LinkPreviewResponse> parseLink(@RequestBody ParseRequest request) {
        if (request == null || request.getUrl() == null || request.getUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    LinkPreviewResponse.builder()
                            .isSuccess(false)
                            .errorMessage("URL is required")
                            .build()
            );
        }

        LinkPreviewResponse response = linkPreviewService.extractPreview(request.getUrl());
        return ResponseEntity.ok(response);
    }
}
