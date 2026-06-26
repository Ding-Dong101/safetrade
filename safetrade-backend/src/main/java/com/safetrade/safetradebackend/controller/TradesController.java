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

    public TradesController(TradesRepository tradesRepository, UsersRepository usersRepository, EscrowService escrowService) {
        this.tradesRepository = tradesRepository;
        this.usersRepository = usersRepository;
        this.escrowService = escrowService;
    }

    // Get all trades or filter by authenticated user and role
    @GetMapping("/")
    public List<Trades> getAll(@RequestHeader(value = "Authorization", required = false) String authHeader,
                               @RequestParam(value = "role", required = false) String role) {
        String userId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            userId = authHeader.substring(7).trim();
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

    // Get trade by ID
    @GetMapping("/{id}")
    public ResponseEntity<Trades> getById(@PathVariable UUID id) {
        return tradesRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create Trade (Stage 1: PENDING)
    @PostMapping("/")
    public ResponseEntity<?> create(@RequestBody Trades request,
                                    @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (request.getTitle() == null || request.getPrice() == null || request.getSellerId() == null) {
            return ResponseEntity.badRequest().body("title, price, and sellerId are required");
        }

        String buyerId = request.getBuyerId();
        if (buyerId == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            buyerId = authHeader.substring(7).trim();
        }

        if (buyerId == null) {
            return ResponseEntity.badRequest().body("buyerId is required (either in request body or as Bearer token in Authorization header)");
        }

        Trades trade = Trades.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .buyerId(buyerId)
                .sellerId(request.getSellerId())
                .status(TradeStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        Trades saved = tradesRepository.save(trade);
        return ResponseEntity.status(201).body(saved);
    }

    // Buyer Deposits Funds (Stage 2: FUNDED)
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

        // Call Escrow Service to hold funds
        String buyerEmail = "buyer@campus.edu"; // default fallback
        try {
            Optional<Users> buyerOpt = usersRepository.findById(UUID.fromString(trade.getBuyerId()));
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

        trade.setStatus(TradeStatus.FUNDED);
        Trades saved = tradesRepository.save(trade);
        return ResponseEntity.ok(saved);
    }

    // Seller Uploads Live Photo & Generates Dispatch Code (Stage 3: DISPATCH_PENDING)
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
        return ResponseEntity.ok(saved);
    }

    // Rider Inspects & Accepts Item using Dispatch Code (Stage 4: IN_TRANSIT)
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
        return ResponseEntity.ok(saved);
    }

    // Rider Drops off at central SafeTrade Post (Stage 5: AT_POST)
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
        return ResponseEntity.ok(saved);
    }

    // Buyer Collects from Operator using Release Code (Stage 6: RELEASED)
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

        // Call Escrow Service to release funds to the seller
        String recipientCode = "RCP_dummy_seller";
        String escrowResponse = escrowService.releaseFunds(trade.getId(), recipientCode, trade.getPrice());
        if (escrowResponse == null) {
            return ResponseEntity.internalServerError().body("Escrow release failed or Escrow service is down");
        }

        trade.setStatus(TradeStatus.RELEASED);
        Trades saved = tradesRepository.save(trade);
        return ResponseEntity.ok(saved);
    }

    // Helper: generates standard secure code
    private String generateCode() {
        int num = (int) (Math.random() * 900000) + 100000;
        return "ST-" + num;
    }

    // Data Transfer Objects
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
