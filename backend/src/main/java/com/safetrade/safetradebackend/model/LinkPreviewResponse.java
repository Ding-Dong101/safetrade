package com.safetrade.safetradebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkPreviewResponse {
    private String url;
    private String title;
    private String description;
    private String image;
    private Double price;
    private Double listedPrice;
    private String sellerContact;
    private String sellerLocation;
    private String currency;
    private String platform;
    private String domain;
    private Map<String, String> attributes;
    private boolean isSuccess;
    private String errorMessage;
}
