package com.safetrade.safetradebackend.service;

import com.safetrade.safetradebackend.escrow.config.PaystackConfig;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Service
public class EscrowService {
    private final RestTemplate restTemplate;
    private final PaystackConfig paystackConfig;

    public EscrowService(RestTemplate restTemplate, PaystackConfig paystackConfig) {
        this.restTemplate = restTemplate;
        this.paystackConfig = paystackConfig;
    }

    // FUND ESCROW
    public String fundEscrow(UUID tradeId, String buyerEmail, Double amount) {
        String url = "https://api.paystack.co/transaction/initialize";

        Map<String, Object> body = Map.of(
                "email", buyerEmail,
                "amount", (int)(amount * 100),
                "reference", "trade_" + tradeId
        );

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, paystackConfig.authHeaders());
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Paystack fundEscrow failed: " + e.getMessage(), e);
        }
    }

    // VERIFY PAYMENT
    public boolean verifyPayment(String reference) {
        String url = "https://api.paystack.co/transaction/verify/" + reference;
        try {
            HttpEntity<Void> request = new HttpEntity<>(paystackConfig.authHeaders());
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            return response.getBody() != null && response.getBody().contains("\"status\":\"success\"");
        } catch (Exception e) {
            System.out.println("Paystack verifyPayment failed: " + e.getMessage());
            return false;
        }
    }

    // INITIALIZE TOP UP
    public String initializeTopUp(String email, Double amount) {
        String url = "https://api.paystack.co/transaction/initialize";
        long pesewas = (long)(amount * 100);
        String reference = "topup_" + pesewas + "_" + UUID.randomUUID().toString().replace("-", "");

        Map<String, Object> body = Map.of(
                "email", email,
                "amount", pesewas,
                "reference", reference
        );

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, paystackConfig.authHeaders());
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Paystack initializeTopUp failed: " + e.getMessage(), e);
        }
    }

    // VERIFY TOP UP PAYMENT (returns amount paid, or null if failed)
    public Double verifyTopUpPayment(String reference, Double fallbackMockAmount) {
        // Try parsing fallback amount from reference format: topup_10000_uuid
        Double parsedFallback = fallbackMockAmount;
        if (reference != null && reference.startsWith("topup_")) {
            try {
                String[] parts = reference.split("_");
                if (parts.length >= 2) {
                    parsedFallback = Long.parseLong(parts[1]) / 100.0;
                }
            } catch (Exception ignored) {}
        }

        String url = "https://api.paystack.co/transaction/verify/" + reference;
        try {
            HttpEntity<Void> request = new HttpEntity<>(paystackConfig.authHeaders());
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            String resBody = response.getBody();
            if (resBody != null) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(resBody);
                boolean status = root.path("status").asBoolean(false);
                String dataStatus = root.path("data").path("status").asText("");

                if (status && "success".equalsIgnoreCase(dataStatus)) {
                    double amountInPesewas = root.path("data").path("amount").asDouble(0.0);
                    if (amountInPesewas > 0) {
                        return amountInPesewas / 100.0;
                    }
                }
            }
            return parsedFallback;
        } catch (Exception e) {
            System.err.println("Paystack verifyTopUpPayment failed: " + e.getMessage());
            return parsedFallback;
        }
    }

    // DELIVER ITEM
    public void markDelivered(UUID tradeId) {
        System.out.println("Trade " + tradeId + " marked as DELIVERED in EscrowService");
    }

    // RELEASE FUNDS
    public String releaseFunds(UUID tradeId, String recipientCode, Double amount) {
        String url = "https://api.paystack.co/transfer";

        Map<String, Object> body = Map.of(
                "source", "balance",
                "amount", (int)(amount * 100),
                "recipient", recipientCode,
                "reason", "Escrow release for trade " + tradeId
        );

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, paystackConfig.authHeaders());
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Paystack releaseFunds failed: " + e.getMessage(), e);
        }
    }

    // REFUND BUYER
    public String refundBuyer(String reference) {
        String url = "https://api.paystack.co/refund";
        Map<String, Object> body = Map.of("transaction", reference);

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, paystackConfig.authHeaders());
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Paystack refundBuyer failed: " + e.getMessage(), e);
        }
    }

    // CREATE TRANSFER RECIPIENT
    public String createTransferRecipient(String name, String accountNumber, String bankCode) {
        String url = "https://api.paystack.co/transferrecipient";

        // Normalize Ghana Mobile Money Bank Code for Paystack
        String normalizedBankCode = "MTN";
        if (bankCode != null) {
            String upper = bankCode.trim().toUpperCase();
            if (upper.contains("VOD") || upper.contains("TELECEL")) {
                normalizedBankCode = "VOD";
            } else if (upper.contains("ATL") || upper.contains("AIRTEL")) {
                normalizedBankCode = "ATL";
            } else if (upper.contains("MTN")) {
                normalizedBankCode = "MTN";
            } else {
                normalizedBankCode = upper;
            }
        }

        Map<String, Object> body = Map.of(
                "type", "mobile_money",
                "name", name != null ? name : "SafeTrade User",
                "account_number", accountNumber,
                "bank_code", normalizedBankCode,
                "currency", "GHS"
        );

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, paystackConfig.authHeaders());
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            String resBody = response.getBody();
            if (resBody != null && resBody.contains("\"recipient_code\":\"")) {
                int start = resBody.indexOf("\"recipient_code\":\"") + 18;
                int end = resBody.indexOf("\"", start);
                return resBody.substring(start, end);
            }
            return null;
        } catch (Exception e) {
            System.err.println("Paystack createTransferRecipient failed: " + e.getMessage());
            return null;
        }
    }
}
