package com.safetrade.safetradebackend.controller;

import com.safetrade.safetradebackend.model.TradeStatus;
import com.safetrade.safetradebackend.model.Trades;
import com.safetrade.safetradebackend.repository.TradesRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v2/trades")
public class TradesController {


    private final TradesRepository tradesRepository;

    public TradesController( TradesRepository tradesRepository) {
        this.tradesRepository = tradesRepository;

    }


    // Get all trades
    @GetMapping("/all")
    public List<Trades> getAll() {
        return tradesRepository.findAll();
    }

    // Get trade by ID
    @GetMapping("/{id}")
    public ResponseEntity<Trades> getById(@PathVariable UUID id) {
        return tradesRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create Trade (Stage 1: CREATED)
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Trades request) {
        if (request.getTitle() == null || request.getPrice() == null ||
                request.getBuyerId() == null || request.getSellerId() == null) {
            return ResponseEntity.badRequest().body("title, price, buyerId, and sellerId are required");
        }

        Trades trade = Trades.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .buyerId(request.getBuyerId())
                .sellerId(request.getSellerId())
                .status(TradeStatus.CREATED)
//                .createdAt(LocalDateTime.now())
                .build();

        Trades saved = tradesRepository.save(trade);
        return ResponseEntity.ok(saved);
    }

    // Buyer Deposits Funds (Stage 2: FUNDED)
//    @PostMapping("/{id}/deposit")
//    public ResponseEntity<?> deposit(@PathVariable UUID id) {
//        Optional<Trades> optionalTrade = tradesRepository.findById(id);
//        if (optionalTrade.isEmpty()) {
//            return ResponseEntity.notFound().build();
//        }
//
//        Trades trade = optionalTrade.get();
//        if (trade.getStatus() != TradeStatus.CREATED) {
//            return ResponseEntity.badRequest().body("Trade is not in CREATED status");
//        }
//
//        // Call Escrow Service to hold funds
//        boolean escrowSuccess = escrowClient.deposit(trade.getId(), trade.getPrice());
//        if (!escrowSuccess) {
//            return ResponseEntity.internalServerError().body("Escrow deposit failed or Escrow service is down");
//        }
//
//        trade.setStatus(TradeStatus.FUNDED);
//        Trade saved = repository.save(trade);
//        return ResponseEntity.ok(saved);
//    }

    // Seller Uploads Live Photo & Generates Dispatch Code (Stage 3: DISPATCH_PENDING)
//    @PostMapping("/{id}/seller-upload")
//    public ResponseEntity<?> sellerUpload(@PathVariable UUID id, @RequestBody SellerUploadRequest request) {
//        Optional<Trade> optionalTrade = repository.findById(id);
//        if (optionalTrade.isEmpty()) {
//            return ResponseEntity.notFound().build();
//        }
//
//        Trade trade = optionalTrade.get();
//        if (trade.getStatus() != TradeStatus.FUNDED) {
//            return ResponseEntity.badRequest().body("Trade must be FUNDED before seller can dispatch");
//        }
//
//        if (request.getItemPhotoBase64() == null || request.getItemPhotoBase64().isEmpty()) {
//            return ResponseEntity.badRequest().body("Live photo is required to generate dispatch code");
//        }
//
//        trade.setItemPhotoBase64(request.getItemPhotoBase64());
//        trade.setDispatchCode(generateCode());
//        trade.setStatus(TradeStatus.DISPATCH_PENDING);
//
//        Trade saved = repository.save(trade);
//        return ResponseEntity.ok(saved);
//    }

    // Rider Inspects & Accepts Item using Dispatch Code (Stage 4: IN_TRANSIT)
//    @PostMapping("/{id}/rider-pickup")
//    public ResponseEntity<?> riderPickup(@PathVariable UUID id, @RequestBody RiderPickupRequest request) {
//        Optional<Trade> optionalTrade = repository.findById(id);
//        if (optionalTrade.isEmpty()) {
//            return ResponseEntity.notFound().build();
//        }
//
//        Trade trade = optionalTrade.get();
//        if (trade.getStatus() != TradeStatus.DISPATCH_PENDING) {
//            return ResponseEntity.badRequest().body("Trade is not pending dispatch");
//        }
//
//        if (request.getRiderId() == null || request.getRiderId().isEmpty()) {
//            return ResponseEntity.badRequest().body("Rider ID is required");
//        }
//
//        if (!trade.getDispatchCode().equalsIgnoreCase(request.getDispatchCode())) {
//            return ResponseEntity.badRequest().body("Invalid dispatch verification code");
//        }
//
//        trade.setRiderId(request.getRiderId());
//        trade.setRiderPickedUpAt(LocalDateTime.now());
//        trade.setDropOffCode(generateCode());
//        trade.setStatus(TradeStatus.IN_TRANSIT);
//
//        Trade saved = repository.save(trade);
//        return ResponseEntity.ok(saved);
//    }

    // Rider Drops off at central SafeTrade Post (Stage 5: AT_POST)
//    @PostMapping("/{id}/post-dropoff")
//    public ResponseEntity<?> postDropoff(@PathVariable UUID id, @RequestBody PostDropoffRequest request) {
//        Optional<Trade> optionalTrade = repository.findById(id);
//        if (optionalTrade.isEmpty()) {
//            return ResponseEntity.notFound().build();
//        }
//
//        Trade trade = optionalTrade.get();
//        if (trade.getStatus() != TradeStatus.IN_TRANSIT) {
//            return ResponseEntity.badRequest().body("Trade is not in transit");
//        }
//
//        if (!trade.getDropOffCode().equalsIgnoreCase(request.getDropOffCode())) {
//            return ResponseEntity.badRequest().body("Invalid drop-off verification code");
//        }
//
//        trade.setPostArrivedAt(LocalDateTime.now());
//        trade.setReleaseCode(generateCode());
//        trade.setStatus(TradeStatus.AT_POST);
//
//        Trade saved = repository.save(trade);
//        return ResponseEntity.ok(saved);
//    }

    // Buyer Collects from Operator using Release Code (Stage 6: RELEASED)
//    @PostMapping("/{id}/buyer-collect")
//    public ResponseEntity<?> buyerCollect(@PathVariable UUID id, @RequestBody BuyerCollectRequest request) {
//        Optional<Trade> optionalTrade = repository.findById(id);
//        if (optionalTrade.isEmpty()) {
//            return ResponseEntity.notFound().build();
//        }
//
//        Trade trade = optionalTrade.get();
//        if (trade.getStatus() != TradeStatus.AT_POST) {
//            return ResponseEntity.badRequest().body("Trade is not at the post");
//        }
//
//        if (!trade.getReleaseCode().equalsIgnoreCase(request.getReleaseCode())) {
//            return ResponseEntity.badRequest().body("Invalid buyer release code");
//        }
//
//        // Call Escrow Service to release funds to the seller
//        boolean escrowSuccess = escrowClient.release(trade.getId());
//        if (!escrowSuccess) {
//            return ResponseEntity.internalServerError().body("Escrow release failed or Escrow service is down");
//        }
//
//        trade.setStatus(TradeStatus.RELEASED);
//        Trade saved = repository.save(trade);
//        return ResponseEntity.ok(saved);
//    }

    // Helper: generates standard secure code
//    private String generateCode() {
//        int num = (int) (Math.random() * 900000) + 100000;
//        return "ST-" + num;
//    }

    // Data Transfer Objects
//    @Data
//    public static class TradeCreateRequest {
//        private String title;
//        private String description;
//        private Double price;
//        private String buyerId;
//        private String sellerId;
//    }
//
//    @Data
//    public static class SellerUploadRequest {
//        private String itemPhotoBase64;
//    }
//
//    @Data
//    public static class RiderPickupRequest {
//        private String riderId;
//        private String dispatchCode;
//    }
//
//    @Data
//    public static class PostDropoffRequest {
//        private String dropOffCode;
//    }
//
//    @Data
//    public static class BuyerCollectRequest {
//        private String releaseCode;
//    }
}
