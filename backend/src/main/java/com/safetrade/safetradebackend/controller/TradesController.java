package com.safetrade.safetradebackend.controller;

import com.safetrade.safetradebackend.model.TradeStatus;
import com.safetrade.safetradebackend.model.Trades;
import com.safetrade.safetradebackend.model.Users;
import com.safetrade.safetradebackend.repository.TradesRepository;
import com.safetrade.safetradebackend.repository.UsersRepository;
import com.safetrade.safetradebackend.service.EscrowService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin
@RestController
@RequestMapping({"/api/v2/trades", "/api/trades"})
public class TradesController {

    private final TradesRepository tradesRepository;
    private final UsersRepository usersRepository;
    private final EscrowService escrowService;
    private final com.safetrade.safetradebackend.service.NotificationService notificationService;

    public TradesController(TradesRepository tradesRepository, UsersRepository usersRepository, EscrowService escrowService, com.safetrade.safetradebackend.service.NotificationService notificationService) {
        this.tradesRepository = tradesRepository;
        this.usersRepository = usersRepository;
        this.escrowService = escrowService;
        this.notificationService = notificationService;
    }

    private void sendNotification(String userId, String type, String message) {
        try {
            Optional<Users> user = usersRepository.findById(java.util.Objects.requireNonNull(UUID.fromString(userId)));
            if(user.isPresent() && user.get().getPushToken() != null) {
                notificationService.sendPushNotification(user.get().getPushToken(), type, message);
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    @GetMapping("/")
    public List<Trades> getAll(@RequestHeader(value = "Authorization", required = false) String authHeader,
                               @RequestParam(value = "role", required = false) String role) {
        String userId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            userId = authHeader.substring(7).trim();
            try {
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if(auth != null && auth.getName() != null) {
                    Optional<Users> user = usersRepository.findByUsername(auth.getName());
                    if (user.isPresent()) {
                        userId = user.get().getId().toString();
                    }
                }
            } catch (Exception e) {}
        }

        if ("all".equalsIgnoreCase(role)) {
            return tradesRepository.findAll();
        }

        if (userId != null) {
            if ("buyer".equalsIgnoreCase(role)) {
                return tradesRepository.findByBuyerId(userId);
            } else if ("seller".equalsIgnoreCase(role)) {
                return tradesRepository.findBySellerId(userId);
            } else {
                java.util.List<Trades> bought = tradesRepository.findByBuyerId(userId);
                java.util.List<Trades> sold = tradesRepository.findBySellerId(userId);
                java.util.List<Trades> all = new java.util.ArrayList<>(bought);
                all.addAll(sold);
                return all;
            }
        }
        return tradesRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trades> getById(@PathVariable UUID id) {
        return tradesRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/")
    public ResponseEntity<?> create(@RequestBody Trades request,
                                    @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (request.getTitle() == null || request.getPrice() == null || request.getSellerId() == null) {
            return ResponseEntity.badRequest().body("title, price, and sellerId are required");
        }

        String buyerId = request.getBuyerId();

        Trades trade = Trades.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .buyerId(buyerId)
                .sellerId(request.getSellerId())
                .status(TradeStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .tradeCode(generateTradeCode())
                .build();

        Trades saved = tradesRepository.save(trade);

        sendNotification(request.getSellerId(), "NEW_TRADE", "A new trade has been initiated with you.");

        return ResponseEntity.status(201).body(saved);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinTrade(@PathVariable UUID id) {
        Optional<Trades> optionalTrade = tradesRepository.findById(id);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return joinTradeInternal(optionalTrade.get());
    }

    @PostMapping("/join/{code}")
    public ResponseEntity<?> joinTradeByCode(@PathVariable String code) {
        Optional<Trades> optionalTrade = tradesRepository.findByTradeCode(code);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return joinTradeInternal(optionalTrade.get());
    }

    private ResponseEntity<?> joinTradeInternal(Trades trade) {
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        Optional<Users> buyerOpt = usersRepository.findByUsername(auth.getName());
        if (buyerOpt.isEmpty()) {
            return ResponseEntity.status(401).body("User not found");
        }

        String buyerId = buyerOpt.get().getId().toString();

        if (buyerId.equals(trade.getSellerId())) {
            return ResponseEntity.badRequest().body("You cannot join your own trade as the buyer");
        }

        trade.setBuyerId(buyerId);
        Trades saved = tradesRepository.save(trade);

        sendNotification(trade.getSellerId(), "TRADE_JOINED", "A buyer has joined your trade.");

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<?> deposit(@PathVariable UUID id) {
        Optional<Trades> optionalTrade = tradesRepository.findById(id);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trades trade = optionalTrade.get();
        if (trade.getStatus() != TradeStatus.CREATED && trade.getStatus() != TradeStatus.PENDING) {
            return ResponseEntity.badRequest().body("Trade is not in CREATED or PENDING status");
        }

        String buyerEmail = "buyer@campus.edu";
        try {
            Optional<Users> buyerOpt = usersRepository.findById(java.util.Objects.requireNonNull(UUID.fromString(trade.getBuyerId())));
            if (buyerOpt.isPresent()) {
                buyerEmail = buyerOpt.get().getEmail();
            }
        } catch (Exception e) {
            System.err.println("Could not resolve buyer email for ID: " + trade.getBuyerId());
        }

        String escrowResponse = escrowService.fundEscrow(trade.getId(), buyerEmail, trade.getPrice());
        if (escrowResponse == null) {
            return ResponseEntity.internalServerError().body("Escrow deposit failed or Escrow service is down");
        }

        return ResponseEntity.ok(escrowResponse);
    }

    @PostMapping("/{id}/verify-payment")
    public ResponseEntity<?> verifyPayment(@PathVariable UUID id) {
        Optional<Trades> optionalTrade = tradesRepository.findById(id);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trades trade = optionalTrade.get();
        String reference = "trade_" + trade.getId();

        boolean verified = escrowService.verifyPayment(reference);
        if (!verified) {
            return ResponseEntity.badRequest().body("Payment could not be verified. Please try again.");
        }

        trade.setStatus(TradeStatus.FUNDED);
        Trades saved = tradesRepository.save(trade);

        sendNotification(trade.getSellerId(), "TRADE_FUNDED", "Funds have been deposited. Please prepare item for dispatch.");

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/seller-upload")
    public ResponseEntity<?> sellerUpload(@PathVariable UUID id, @RequestBody SellerUploadRequest request) {
        Optional<Trades> optionalTrade = tradesRepository.findById(id);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trades trade = optionalTrade.get();
        if (trade.getStatus() != TradeStatus.FUNDED) {
            return ResponseEntity.badRequest().body("Trade must be FUNDED before seller can dispatch");
        }

        if (request.getItemPhotoBase64() == null || request.getItemPhotoBase64().isEmpty()) {
            return ResponseEntity.badRequest().body("Live photo is required to generate dispatch code");
        }

        trade.setItemPhotoBase64(request.getItemPhotoBase64());
        trade.setDispatchCode(generateCode());
        trade.setStatus(TradeStatus.DISPATCH_PENDING);

        Trades saved = tradesRepository.save(trade);

        sendNotification(trade.getBuyerId(), "DISPATCH_PENDING", "Seller has verified item photo and is awaiting dispatch.");

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/rider-pickup")
    public ResponseEntity<?> riderPickup(@PathVariable UUID id, @RequestBody RiderPickupRequest request) {
        Optional<Trades> optionalTrade = tradesRepository.findById(id);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trades trade = optionalTrade.get();
        if (trade.getStatus() != TradeStatus.DISPATCH_PENDING) {
            return ResponseEntity.badRequest().body("Trade is not pending dispatch");
        }

        if (request.getRiderId() == null || request.getRiderId().isEmpty()) {
            return ResponseEntity.badRequest().body("Rider ID is required");
        }

        if (trade.getDispatchCode() == null || !trade.getDispatchCode().equalsIgnoreCase(request.getDispatchCode())) {
            return ResponseEntity.badRequest().body("Invalid dispatch verification code");
        }

        trade.setRiderId(request.getRiderId());
        trade.setRiderPickedUpAt(LocalDateTime.now());
        trade.setDropOffCode(generateCode());
        trade.setStatus(TradeStatus.IN_TRANSIT);

        Trades saved = tradesRepository.save(trade);

        sendNotification(trade.getBuyerId(), "IN_TRANSIT", "Rider has picked up the item and it is in transit.");
        sendNotification(trade.getSellerId(), "IN_TRANSIT", "Rider has successfully picked up your item.");

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/post-dropoff")
    public ResponseEntity<?> postDropoff(@PathVariable UUID id, @RequestBody PostDropoffRequest request) {
        Optional<Trades> optionalTrade = tradesRepository.findById(id);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trades trade = optionalTrade.get();
        if (trade.getStatus() != TradeStatus.IN_TRANSIT) {
            return ResponseEntity.badRequest().body("Trade is not in transit");
        }

        if (trade.getDropOffCode() == null || !trade.getDropOffCode().equalsIgnoreCase(request.getDropOffCode())) {
            return ResponseEntity.badRequest().body("Invalid drop-off verification code");
        }

        trade.setPostArrivedAt(LocalDateTime.now());
        trade.setReleaseCode(generateCode());
        trade.setStatus(TradeStatus.AT_POST);

        Trades saved = tradesRepository.save(trade);

        sendNotification(trade.getBuyerId(), "AT_POST", "Your item has arrived at the SafeTrade post. Please collect it using your release code.");
        sendNotification(trade.getSellerId(), "AT_POST", "Item has successfully reached the SafeTrade post.");

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/buyer-collect")
    public ResponseEntity<?> buyerCollect(@PathVariable UUID id, @RequestBody BuyerCollectRequest request) {
        Optional<Trades> optionalTrade = tradesRepository.findById(id);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trades trade = optionalTrade.get();
        if (trade.getStatus() != TradeStatus.AT_POST) {
            return ResponseEntity.badRequest().body("Trade is not at the post");
        }

        if (trade.getReleaseCode() == null || !trade.getReleaseCode().equalsIgnoreCase(request.getReleaseCode())) {
            return ResponseEntity.badRequest().body("Invalid buyer release code");
        }

        String recipientCode = "RCP_dummy_seller";
        String escrowResponse = escrowService.releaseFunds(trade.getId(), recipientCode, trade.getPrice());
        if (escrowResponse == null) {
            return ResponseEntity.internalServerError().body("Escrow release failed or Escrow service is down");
        }

        trade.setStatus(TradeStatus.RELEASED);
        Trades saved = tradesRepository.save(trade);
        return ResponseEntity.ok(saved);
    }

    private String generateCode() {
        int num = (int) (Math.random() * 900000) + 100000;
        return "ST-" + num;
    }

    private String generateTradeCode() {
        String code;
        do {
            code = String.valueOf((int) (Math.random() * 90000) + 10000);
        } while (tradesRepository.findByTradeCode(code).isPresent());
        return code;
    }

    @Data
    public static class SellerUploadRequest {
        private String itemPhotoBase64;
    }

    @Data
    public static class RiderPickupRequest {
        private String riderId;
        private String dispatchCode;
    }

    @Data
    public static class PostDropoffRequest {
        private String dropOffCode;
    }

    @Data
    public static class BuyerCollectRequest {
        private String releaseCode;
    }
}