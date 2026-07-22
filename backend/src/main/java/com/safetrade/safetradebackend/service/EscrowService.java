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
        String reference = "topup_" + UUID.randomUUID().toString().replace("-", "");

        Map<String, Object> body = Map.of(
                "email", email,
                "amount", (int)(amount * 100),
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
        String url = "https://api.paystack.co/transaction/verify/" + reference;
        try {
            HttpEntity<Void> request = new HttpEntity<>(paystackConfig.authHeaders());
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            String resBody = response.getBody();
            if (resBody != null && resBody.contains("\"status\":\"success\"")) {
                int start = resBody.indexOf("\"amount\":") + 9;
                int end = resBody.indexOf(",", start);
                if (end == -1) end = resBody.indexOf("}", start);
                String amountStr = resBody.substring(start, end).trim();
                return Double.parseDouble(amountStr) / 100.0;
            }
            return null;
        } catch (Exception e) {
            System.out.println("Paystack verifyTopUpPayment failed: " + e.getMessage());
            return null;
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
        Map<String, Object> body = Map.of(
                "type", "mobile_money",
                "name", name,
                "account_number", accountNumber,
                "bank_code", bankCode,
                "currency", "GHS"
        );

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, paystackConfig.authHeaders());
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            // Extract recipient_code from JSON (e.g. {"status":true,"data":{"recipient_code":"RCP_xxx"}})
            String resBody = response.getBody();
            if (resBody != null && resBody.contains("\"recipient_code\":\"")) {
                int start = resBody.indexOf("\"recipient_code\":\"") + 18;
                int end = resBody.indexOf("\"", start);
                return resBody.substring(start, end);
            }
            return null;
        } catch (Exception e) {
            System.out.println("Paystack createTransferRecipient failed: " + e.getMessage());
            return null;
        }
    }
}
