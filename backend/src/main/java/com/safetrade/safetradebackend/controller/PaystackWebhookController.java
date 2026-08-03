package com.safetrade.safetradebackend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.safetrade.safetradebackend.escrow.config.PaystackConfig;
import com.safetrade.safetradebackend.model.TradeStatus;
import com.safetrade.safetradebackend.model.Trades;
import com.safetrade.safetradebackend.model.Users;
import com.safetrade.safetradebackend.repository.TradesRepository;
import com.safetrade.safetradebackend.repository.UsersRepository;
import com.safetrade.safetradebackend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin
@RestController
@RequestMapping({"/api/webhooks/paystack", "/api/v2/webhooks/paystack"})
public class PaystackWebhookController {

    private final TradesRepository tradesRepository;
    private final UsersRepository usersRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final PaystackConfig paystackConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaystackWebhookController(
            TradesRepository tradesRepository,
            UsersRepository usersRepository,
            NotificationService notificationService,
            SimpMessagingTemplate messagingTemplate,
            PaystackConfig paystackConfig
    ) {
        this.tradesRepository = tradesRepository;
        this.usersRepository = usersRepository;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
        this.paystackConfig = paystackConfig;
    }

    @PostMapping
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "x-paystack-signature", required = false) String signature
    ) {
        try {
            // Optional signature verification if secret key is present
            String secretKey = paystackConfig.getSecretKey();
            if (secretKey != null && !secretKey.isBlank() && signature != null && !signature.isBlank()) {
                if (!verifySignature(payload, signature, secretKey)) {
                    System.err.println("Paystack Webhook: Invalid signature received");
                    return ResponseEntity.status(401).body("Invalid signature");
                }
            }

            JsonNode root = objectMapper.readTree(payload);
            String event = root.path("event").asText("");
            JsonNode data = root.path("data");

            if ("charge.success".equalsIgnoreCase(event)) {
                handleChargeSuccess(data);
            } else if ("transfer.success".equalsIgnoreCase(event)) {
                System.out.println("Paystack Webhook: Transfer succeeded for reference " + data.path("reference").asText());
            } else if ("transfer.failed".equalsIgnoreCase(event)) {
                System.err.println("Paystack Webhook: Transfer failed for reference " + data.path("reference").asText());
            }

            return ResponseEntity.ok("Webhook processed");
        } catch (Exception e) {
            System.err.println("Paystack webhook error: " + e.getMessage());
            return ResponseEntity.ok("Error handled");
        }
    }

    private void handleChargeSuccess(JsonNode data) {
        String reference = data.path("reference").asText("");
        long amountInPesewas = data.path("amount").asLong(0);
        double amount = amountInPesewas / 100.0;
        String customerEmail = data.path("customer").path("email").asText("");

        // 1. Check if trade escrow payment: trade_<tradeId> or trade_<tradeId>_<timestamp>
        if (reference.startsWith("trade_")) {
            String[] parts = reference.split("_");
            if (parts.length >= 2) {
                String tradeIdStr = parts[1];
                try {
                    UUID tradeId = UUID.fromString(tradeIdStr);
                    Optional<Trades> tradeOpt = tradesRepository.findById(tradeId);
                    if (tradeOpt.isPresent()) {
                        Trades trade = tradeOpt.get();
                        if (trade.getStatus() == TradeStatus.CREATED || trade.getStatus() == TradeStatus.PENDING) {
                            trade.setStatus(TradeStatus.FUNDED);
                            Trades saved = tradesRepository.save(trade);

                            // Send push notification to seller
                            sendNotification(trade.getSellerId(), "TRADE_FUNDED", "Payment received! Escrow is now funded. Please prepare item for dispatch.");
                            
                            // Send push notification to buyer
                            sendNotification(trade.getBuyerId(), "TRADE_FUNDED", "Your payment of GHS " + trade.getPrice() + " is securely locked in escrow.");

                            // Broadcast live update via WebSocket
                            try {
                                messagingTemplate.convertAndSend("/topic/trades", saved);
                                messagingTemplate.convertAndSend("/topic/trade/" + trade.getId(), saved);
                            } catch (Exception wsErr) {
                                System.err.println("WebSocket broadcast error: " + wsErr.getMessage());
                            }
                            System.out.println("Paystack Webhook: Trade " + tradeId + " successfully marked as FUNDED");
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Failed to process trade escrow in webhook: " + e.getMessage());
                }
            }
        }
        // 2. Check if wallet top-up: topup_<pesewas>_<uuid>
        else if (reference.startsWith("topup_")) {
            try {
                if (customerEmail != null && !customerEmail.isBlank()) {
                    for (Users user : usersRepository.findAll()) {
                        if (customerEmail.equalsIgnoreCase(user.getEmail())) {
                            double currentBalance = user.getBalance() != null ? user.getBalance() : 0.0;
                            user.setBalance(currentBalance + amount);
                            usersRepository.save(user);

                            sendNotification(user.getId().toString(), "TOPUP_SUCCESS", "Your wallet was credited with GHS " + amount);
                            System.out.println("Paystack Webhook: Credited GHS " + amount + " to user " + user.getUsername());
                            break;
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to process wallet topup in webhook: " + e.getMessage());
            }
        }
    }

    private void sendNotification(String userId, String type, String message) {
        if (userId == null || userId.isBlank()) return;
        try {
            Optional<Users> user = usersRepository.findById(UUID.fromString(userId));
            if (user.isPresent() && user.get().getPushToken() != null) {
                notificationService.sendPushNotification(user.get().getPushToken(), type, message);
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    private boolean verifySignature(String payload, String signature, String secretKey) {
        try {
            Mac sha512Hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha512Hmac.init(secretKeySpec);
            byte[] hash = sha512Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equalsIgnoreCase(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
