package com.safetrade.safetradebackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UUID userId;
    private String name;
    private UserDto user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private UUID id;
        private String firstName;
        private String lastName;
        private String username;
        private String email;
        private String phone;
        private String avatar;
        private boolean isAdmin;
        private String createdAt;
        private Double balance;
        private String paymentName;
        private String paymentNumber;
        private String paymentNetwork;
    }
}
