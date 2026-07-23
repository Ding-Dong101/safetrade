package com.safetrade.safetradebackend.controller;

import com.safetrade.safetradebackend.model.TradeStatus;
import com.safetrade.safetradebackend.model.Trades;
import com.safetrade.safetradebackend.repository.TradesRepository;
import com.safetrade.safetradebackend.service.EscrowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin
@RestController
@RequestMapping("/api/escrow")
public class EscrowController {
    private final EscrowService escrowService;
    private final TradesRepository tradesRepository;
    private final com.safetrade.safetradebackend.repository.UsersRepository usersRepository;
    private final com.safetrade.safetradebackend.service.NotificationService notificationService;

    public EscrowController(EscrowService escrowService, TradesRepository tradesRepository, com.safetrade.safetradebackend.repository.UsersRepository usersRepository, com.safetrade.safetradebackend.service.NotificationService notificationService) {
        this.escrowService = escrowService;
        this.tradesRepository = tradesRepository;
        this.usersRepository = usersRepository;
        this.notificationService = notificationService;
    }

    @PostMapping("/init/{tradeId}")
    public ResponseEntity<?> init(@PathVariable @NonNull UUID tradeId) {
        Optional<Trades> optionalTrade = tradesRepository.findById(tradeId);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Trades trade = optionalTrade.get();
        trade.setStatus(TradeStatus.PENDING);
        Trades saved = tradesRepository.save(trade);
        return ResponseEntity.status(201).body(saved);
    }

    @PostMapping("/fund/{tradeId}")
    public ResponseEntity<?> fund(@PathVariable @NonNull UUID tradeId,
                                  @RequestParam(required = false) String buyerEmail,
                                  @RequestParam(required = false) Double amount) {
        Optional<Trades> optionalTrade = tradesRepository.findById(tradeId);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Trades trade = optionalTrade.get();
        
        String email = buyerEmail != null ? buyerEmail : "buyer@campus.edu";
        Double amt = amount != null ? amount : trade.getPrice();

        escrowService.fundEscrow(tradeId, email, amt);
        trade.setStatus(TradeStatus.FUNDED);
        Trades saved = tradesRepository.save(trade);

        sendNotification(trade.getSellerId(), "ESCROW_FUNDED", "Buyer has funded the escrow for trade #" + tradeId);

        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/deliver/{tradeId}")
    public ResponseEntity<?> deliver(@PathVariable @NonNull UUID tradeId) {
        Optional<Trades> optionalTrade = tradesRepository.findById(tradeId);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Trades trade = optionalTrade.get();
        if (trade.getStatus() != TradeStatus.FUNDED) {
            return ResponseEntity.badRequest().body("Trade must be FUNDED before seller can mark delivered");
        }
        trade.setStatus(TradeStatus.DELIVERED);
        Trades saved = tradesRepository.save(trade);

        sendNotification(trade.getBuyerId(), "ESCROW_DELIVERED", "Seller has marked the item as delivered for trade #" + tradeId);

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/release/{tradeId}")
    public ResponseEntity<?> release(@PathVariable @NonNull UUID tradeId,
                                     @RequestParam(required = false) String recipientCode,
                                     @RequestParam(required = false) Double amount) {
        Optional<Trades> optionalTrade = tradesRepository.findById(tradeId);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Trades trade = optionalTrade.get();
        if (trade.getStatus() != TradeStatus.DELIVERED && trade.getStatus() != TradeStatus.AT_POST) {
            return ResponseEntity.badRequest().body("Trade must be DELIVERED or AT_POST before releasing funds");
        }

        String rc = recipientCode != null ? recipientCode : "RCP_dummy_seller";
        Double amt = amount != null ? amount : trade.getPrice();

        escrowService.releaseFunds(tradeId, rc, amt);
        trade.setStatus(TradeStatus.RELEASED);
        Trades saved = tradesRepository.save(trade);

        sendNotification(trade.getSellerId(), "ESCROW_RELEASED", "Funds have been released for trade #" + tradeId);

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/refund/{tradeId}")
    public ResponseEntity<?> refund(@PathVariable @NonNull UUID tradeId) {
        Optional<Trades> optionalTrade = tradesRepository.findById(tradeId);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Trades trade = optionalTrade.get();
        if (trade.getStatus() != TradeStatus.PENDING && trade.getStatus() != TradeStatus.FUNDED) {
            return ResponseEntity.badRequest().body("Refund is only allowed if trade is PENDING or FUNDED");
        }

        escrowService.refundBuyer("trade_" + tradeId);
        trade.setStatus(TradeStatus.REFUNDED);
        Trades saved = tradesRepository.save(trade);

        sendNotification(trade.getBuyerId(), "ESCROW_REFUNDED", "Trade cancelled and buyer refunded for trade #" + tradeId);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/status/{tradeId}")
    public ResponseEntity<?> getStatus(@PathVariable @NonNull UUID tradeId) {
        Optional<Trades> optionalTrade = tradesRepository.findById(tradeId);
        if (optionalTrade.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Trades trade = optionalTrade.get();

        return ResponseEntity.ok(java.util.Map.of(
                "tradeId", tradeId,
                "status", trade.getStatus(),
                "updatedAt", java.time.LocalDateTime.now().toString()
        ));
    }

    private void sendNotification(String userId, String type, String message) {
        if (userId == null || userId.isBlank()) return;
        try {
            Optional<com.safetrade.safetradebackend.model.Users> user = usersRepository.findById(UUID.fromString(userId));
            if(user.isPresent() && user.get().getPushToken() != null) {
                notificationService.sendPushNotification(user.get().getPushToken(), type, message);
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }
}
