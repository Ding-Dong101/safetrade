package com.safetrade.safetradebackend.escrow.service;

import com.safetrade.safetradebackend.escrow.config.PaystackConfig;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class EscrowService {
    private final RestTemplate restTemplate;
    private final PaystackConfig paystackConfig;

    public EscrowService(RestTemplate restTemplate, PaystackConfig paystackConfig) {
        this.restTemplate = restTemplate;
        this.paystackConfig = paystackConfig;
    }

    // FUND ESCROW
    public String fundEscrow(Long tradeId, String buyerEmail, Double amount) {
        String url = "https://api.paystack.co/transaction/initialize";

        Map<String, Object> body = Map.of(
                "email", buyerEmail,
                "amount", (int)(amount * 100),
                "reference", "trade_" + tradeId
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, paystackConfig.authHeaders());
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        return response.getBody();
    }

    // VERIFY PAYMENT
    public boolean verifyPayment(String reference) {
        String url = "https://api.paystack.co/transaction/verify/" + reference;
        HttpEntity<Void> request = new HttpEntity<>(paystackConfig.authHeaders());
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
        return response.getBody().contains("\"status\":\"success\"");
    }

    // DELIVER ITEM
    public void markDelivered(Long tradeId) {
        // Update escrow state in DB to DELIVERED
    }

    // RELEASE FUNDS
    public String releaseFunds(Long tradeId, String recipientCode, Double amount) {
        String url = "https://api.paystack.co/transfer";

        Map<String, Object> body = Map.of(
                "source", "balance",
                "amount", (int)(amount * 100),
                "recipient", recipientCode,
                "reason", "Escrow release for trade " + tradeId
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, paystackConfig.authHeaders());
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        return response.getBody();
    }

    // REFUND BUYER
    public String refundBuyer(String reference) {
        String url = "https://api.paystack.co/refund";
        Map<String, Object> body = Map.of("transaction", reference);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, paystackConfig.authHeaders());
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        return response.getBody();
    }
}
