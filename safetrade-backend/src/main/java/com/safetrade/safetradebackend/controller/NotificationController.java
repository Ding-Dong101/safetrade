package com.safetrade.safetradebackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/api/notify")
public class NotificationController {

    @PostMapping
    public ResponseEntity<?> notifyUser(@RequestBody NotificationRequest request) {
        System.out.println("NOTIFY: " + request.getMessage());
        return ResponseEntity.ok(java.util.Map.of("status", "success"));
    }

    @lombok.Data
    public static class NotificationRequest {
        private String userId;
        private String type;
        private String message;
    }
}
