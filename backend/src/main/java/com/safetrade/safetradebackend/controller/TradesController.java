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
        if (userId == null || userId.isBlank()) return;
        try {
            Optional<Users> user = usersRepository.findById(UUID.fromString(userId));
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
                .pickupLocation(request.getPickupLocation())
                .price(request.getPrice())
                .buyerId(buyerId)
                .sellerId(request.getSellerId())
                .status(TradeStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .tradeCode(generateTradeCode())
                .riderCode(generateRiderCode())
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
    public ResponseEntity<?> deposit(@PathVariable UUID id, java.security.Principal principal) {
        Optional<Trades> optionalTrade = tradesRepository.findById(id);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trades trade = optionalTrade.get();
        if (trade.getStatus() != TradeStatus.CREATED && trade.getStatus() != TradeStatus.PENDING) {
            return ResponseEntity.badRequest().body("Trade is not in CREATED or PENDING status");
        }

        String buyerEmail = "buyer@campus.edu";

        // Try resolving buyer email from Principal
        if (principal != null) {
            for (Users u : usersRepository.findAll()) {
                if (u.getUsername() != null && u.getUsername().equalsIgnoreCase(principal.getName())) {
                    if (u.getEmail() != null && !u.getEmail().isEmpty()) {
                        buyerEmail = u.getEmail();
                        break;
                    }
                }
            }
        }

        // Fallback: try resolving from trade.getBuyerId()
        if ("buyer@campus.edu".equals(buyerEmail) && trade.getBuyerId() != null) {
            for (Users u : usersRepository.findAll()) {
                if (u.getId().toString().equalsIgnoreCase(trade.getBuyerId()) || u.getUsername().equalsIgnoreCase(trade.getBuyerId())) {
                    if (u.getEmail() != null && !u.getEmail().isEmpty()) {
                        buyerEmail = u.getEmail();
                        break;
                    }
                }
            }
        }

        try {
            String escrowResponse = escrowService.fundEscrow(trade.getId(), buyerEmail, trade.getPrice());
            if (escrowResponse == null) {
                return ResponseEntity.internalServerError().body("Escrow deposit failed or Escrow service is down");
            }
            return ResponseEntity.ok(escrowResponse);
        } catch (Exception e) {
            System.err.println("Deposit initialization failed: " + e.getMessage());
            return ResponseEntity.status(500).body("Deposit initialization failed: " + e.getMessage());
        }
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
        
        // Stage 1 Code: Seller Dispatch Code
        if (trade.getDispatchCode() == null) {
            trade.setDispatchCode(generateCode());
        }
        // Stage 2 Code: Buyer Delivery Code (100% DISTINCT from Stage 1)
        if (trade.getReleaseCode() == null) {
            String deliveryCode = generateCode();
            trade.setReleaseCode(deliveryCode);
            trade.setDirectDeliveryCode(deliveryCode);
        }

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

        String inputDispatch = request.getDispatchCode() != null ? request.getDispatchCode().trim() : "";
        String inputDispatchDigits = inputDispatch.replaceAll("[^0-9]", "");
        boolean isDispatchValid = (trade.getDispatchCode() != null && trade.getDispatchCode().equalsIgnoreCase(inputDispatch))
                || (trade.getDispatchCode() != null && !inputDispatchDigits.isEmpty() && trade.getDispatchCode().endsWith(inputDispatchDigits));

        if (!isDispatchValid) {
            return ResponseEntity.badRequest().body("Invalid dispatch verification code");
        }

        trade.setRiderId(request.getRiderId());
        trade.setRiderPickedUpAt(LocalDateTime.now());

        if (trade.getReleaseCode() == null) {
            String deliveryCode = generateCode();
            trade.setReleaseCode(deliveryCode);
            trade.setDirectDeliveryCode(deliveryCode);
        }

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

        String inputCode = request.getDropOffCode() != null ? request.getDropOffCode().trim() : (request.getCode() != null ? request.getCode().trim() : "");
        String inputDigits = inputCode.replaceAll("[^0-9]", "");
        boolean isValid = (trade.getDropOffCode() != null && trade.getDropOffCode().equalsIgnoreCase(inputCode))
                || (trade.getReleaseCode() != null && trade.getReleaseCode().equalsIgnoreCase(inputCode))
                || (!inputDigits.isEmpty() && trade.getReleaseCode() != null && trade.getReleaseCode().endsWith(inputDigits));

        if (inputCode.isEmpty() || !isValid) {
            return ResponseEntity.badRequest().body("Invalid drop-off code");
        }

        trade.setStatus(TradeStatus.AT_POST);
        trade.setPostArrivedAt(LocalDateTime.now());
        Trades saved = tradesRepository.save(trade);

        sendNotification(trade.getBuyerId(), "AT_POST", "Your item has arrived at the post office and is ready for pickup.");
        sendNotification(trade.getSellerId(), "AT_POST", "Your item has arrived safely at the post office.");

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

        return completeTradeAndReleaseFunds(trade, "Item collected by buyer from post office.");
    }

    @GetMapping("/rider-code/{code}")
    public ResponseEntity<?> getTradeByRiderCode(@PathVariable String code) {
        String cleanCode = code != null ? code.trim() : "";
        if (cleanCode.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        for (Trades t : tradesRepository.findAll()) {
            boolean matches = (t.getRiderCode() != null && t.getRiderCode().equalsIgnoreCase(cleanCode))
                    || (t.getDirectDeliveryCode() != null && t.getDirectDeliveryCode().equalsIgnoreCase(cleanCode))
                    || (t.getReleaseCode() != null && t.getReleaseCode().equalsIgnoreCase(cleanCode))
                    || (t.getDispatchCode() != null && t.getDispatchCode().equalsIgnoreCase(cleanCode))
                    || (t.getTradeCode() != null && t.getTradeCode().equalsIgnoreCase(cleanCode))
                    || (t.getId() != null && t.getId().toString().equalsIgnoreCase(cleanCode));

            if (!matches) {
                // Also match numeric portion or ST- prefixed code
                String numOnly = cleanCode.replaceAll("[^0-9]", "");
                if (!numOnly.isEmpty()) {
                    matches = (t.getDirectDeliveryCode() != null && t.getDirectDeliveryCode().endsWith(numOnly))
                            || (t.getReleaseCode() != null && t.getReleaseCode().endsWith(numOnly))
                            || (t.getDispatchCode() != null && t.getDispatchCode().endsWith(numOnly))
                            || (t.getRiderCode() != null && t.getRiderCode().endsWith(numOnly))
                            || (t.getTradeCode() != null && t.getTradeCode().endsWith(numOnly));
                }
            }

            if (matches) {
                return ResponseEntity.ok(t);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/rider-accept")
    public ResponseEntity<?> riderAccept(@PathVariable UUID id, @RequestBody RiderAcceptRequest request) {
        Optional<Trades> optionalTrade = tradesRepository.findById(id);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Trades trade = optionalTrade.get();
        if (request.getRiderId() == null || request.getRiderId().isEmpty()) {
            return ResponseEntity.badRequest().body("Rider ID is required");
        }
        trade.setRiderId(request.getRiderId());
        if (trade.getDropOffCode() == null) trade.setDropOffCode(generateCode());
        if (trade.getDirectDeliveryCode() == null) trade.setDirectDeliveryCode(generateCode());
        // Maintain DISPATCH_PENDING so rider enters seller's dispatch code to confirm pickup
        if (trade.getStatus() != TradeStatus.IN_TRANSIT) {
            trade.setStatus(TradeStatus.DISPATCH_PENDING);
        }
        Trades saved = tradesRepository.save(trade);

        sendNotification(trade.getBuyerId(), "DISPATCH_PENDING", "A rider has accepted the delivery and is heading for pickup.");
        sendNotification(trade.getSellerId(), "DISPATCH_PENDING", "A rider has accepted your delivery and is heading for pickup.");

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/rider-confirm")
    public ResponseEntity<?> riderConfirm(@PathVariable UUID id, @RequestBody RiderConfirmRequest request) {
        Optional<Trades> optionalTrade = tradesRepository.findById(id);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Trades trade = optionalTrade.get();
        if (trade.getStatus() != TradeStatus.IN_TRANSIT) {
            return ResponseEntity.badRequest().body("Trade is not in transit");
        }

        String inputCode = request.getEffectiveCode();
        String inputDigits = inputCode.replaceAll("[^0-9]", "");

        if (inputCode.isEmpty()) {
            return ResponseEntity.badRequest().body("Delivery confirmation code is required");
        }

        boolean isDeliveryValid = false;

        // Stage 2 Validation: Check against Buyer Delivery Code (directDeliveryCode / releaseCode)
        if (trade.getDirectDeliveryCode() != null && trade.getDirectDeliveryCode().equalsIgnoreCase(inputCode)) {
            isDeliveryValid = true;
        } else if (trade.getReleaseCode() != null && trade.getReleaseCode().equalsIgnoreCase(inputCode)) {
            isDeliveryValid = true;
        }

        if (!isDeliveryValid && !inputDigits.isEmpty()) {
            if (trade.getDirectDeliveryCode() != null && trade.getDirectDeliveryCode().endsWith(inputDigits)) {
                isDeliveryValid = true;
            } else if (trade.getReleaseCode() != null && trade.getReleaseCode().endsWith(inputDigits)) {
                isDeliveryValid = true;
            }
        }

        if (isDeliveryValid) {
            return completeTradeAndReleaseFunds(trade, "Rider confirmed delivery using buyer code.");
        }

        return ResponseEntity.badRequest().body("Invalid delivery confirmation code. Please enter the code shown on the buyer's screen.");
    }

    private ResponseEntity<?> completeTradeAndReleaseFunds(Trades trade, String logContext) {
        boolean transferAttempted = false;
        boolean transferSuccess = false;

        try {
            Users seller = null;
            if (trade.getSellerId() != null) {
                for (Users u : usersRepository.findAll()) {
                    if (u.getId().toString().equalsIgnoreCase(trade.getSellerId()) || 
                        (u.getUsername() != null && u.getUsername().equalsIgnoreCase(trade.getSellerId()))) {
                        seller = u;
                        break;
                    }
                }
            }

            if (seller != null) {
                Double currentBalance = seller.getBalance() == null ? 0.0 : seller.getBalance();
                seller.setBalance(currentBalance + trade.getPrice());

                String recipientCode = seller.getPaystackRecipientCode();

                // If no recipient code saved yet, but seller has MoMo details saved, create recipient code now
                if ((recipientCode == null || recipientCode.isEmpty()) 
                        && seller.getPaymentNumber() != null && !seller.getPaymentNumber().isEmpty()
                        && seller.getPaymentNetwork() != null && !seller.getPaymentNetwork().isEmpty()) {
                    String name = seller.getPaymentName() != null && !seller.getPaymentName().isEmpty() 
                            ? seller.getPaymentName() 
                            : (seller.getFirstname() + " " + seller.getLastname());
                    recipientCode = escrowService.createTransferRecipient(name, seller.getPaymentNumber(), seller.getPaymentNetwork());
                    if (recipientCode != null) {
                        seller.setPaystackRecipientCode(recipientCode);
                    }
                }

                usersRepository.save(seller);

                // Initiate Paystack Mobile Money Transfer to Seller
                if (recipientCode != null && !recipientCode.isEmpty()) {
                    transferAttempted = true;
                    try {
                        escrowService.releaseFunds(trade.getId(), recipientCode, trade.getPrice());
                        transferSuccess = true;
                        System.out.println("Paystack MoMo transfer initiated for seller " + seller.getUsername() + " (" + recipientCode + ")");
                    } catch (Exception paystackErr) {
                        System.err.println("Paystack transfer call failed: " + paystackErr.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Could not process seller release: " + e.getMessage());
        }

        trade.setStatus(TradeStatus.RELEASED);
        tradesRepository.save(trade);

        // Transition to CLOSED state
        trade.setStatus(TradeStatus.CLOSED);
        Trades saved = tradesRepository.save(trade);

        String sellerMsg = transferSuccess 
                ? "Delivery confirmed! Funds of GHS " + trade.getPrice() + " have been transferred to your Mobile Money wallet." 
                : transferAttempted 
                ? "Delivery confirmed! Payout process initiated for your account balance."
                : "Delivery confirmed! Funds of GHS " + trade.getPrice() + " added to your balance. Save Mobile Money details in Settings to withdraw.";

        try {
            sendNotification(trade.getBuyerId(), "CLOSED", "Delivery confirmed and trade completed.");
            sendNotification(trade.getSellerId(), "CLOSED", sellerMsg);
        } catch (Exception e) {
            System.err.println("Notification warning: " + e.getMessage());
        }

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

    private String generateRiderCode() {
        String code;
        do {
            code = String.valueOf((int) (Math.random() * 90000) + 10000);
        } while (tradesRepository.findByRiderCode(code).isPresent());
        return code;
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<?> clearAllTrades() {
        long count = tradesRepository.count();
        tradesRepository.deleteAll();
        return ResponseEntity.ok(java.util.Map.of("message", "All trades cleared successfully", "deletedCount", count));
    }

    @PostMapping("/clear-all")
    public ResponseEntity<?> clearAllTradesPost() {
        long count = tradesRepository.count();
        tradesRepository.deleteAll();
        return ResponseEntity.ok(java.util.Map.of("message", "All trades cleared successfully", "deletedCount", count));
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
        private String code;
    }

    @Data
    public static class BuyerCollectRequest {
        private String releaseCode;
    }


    @Data
    public static class RiderAcceptRequest {
        private String riderId;
    }

    @Data
    public static class RiderConfirmRequest {
        private String releaseCode;
        private String code;
        private String tradeId;
        private String directDeliveryCode;

        public String getEffectiveCode() {
            if (releaseCode != null && !releaseCode.trim().isEmpty()) return releaseCode.trim();
            if (code != null && !code.trim().isEmpty()) return code.trim();
            if (tradeId != null && !tradeId.trim().isEmpty()) return tradeId.trim();
            if (directDeliveryCode != null && !directDeliveryCode.trim().isEmpty()) return directDeliveryCode.trim();
            return "";
        }
    }
}