package com.safetrade.safetradebackend.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class NotificationService {
    private final RestTemplate restTemplate;

    public NotificationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void sendPushNotification(String pushToken, String title, String bodyText) {
        if (pushToken == null || (!pushToken.startsWith("ExponentPushToken") && !pushToken.startsWith("ExpoPushToken"))) return;
        
        String url = "https://exp.host/--/api/v2/push/send";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> body = Map.of(
            "to", pushToken,
            "title", title,
            "body", bodyText
        );
        
        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, request, String.class);
        } catch (Exception e) {
            System.err.println("Failed to send push notification: " + e.getMessage());
        }
    }
}
