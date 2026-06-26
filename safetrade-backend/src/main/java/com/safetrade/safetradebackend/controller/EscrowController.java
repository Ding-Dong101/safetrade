package com.safetrade.safetradebackend.controller;

import com.safetrade.safetradebackend.model.TradeStatus;
import com.safetrade.safetradebackend.model.Trades;
import com.safetrade.safetradebackend.repository.TradesRepository;
import com.safetrade.safetradebackend.service.EscrowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin
@RestController
@RequestMapping("/api/escrow")
public class EscrowController {
    private final EscrowService escrowService;
    private final TradesRepository tradesRepository;
    private final RestTemplate restTemplate;

    public EscrowController(EscrowService escrowService, TradesRepository tradesRepository, RestTemplate restTemplate) {
        this.escrowService = escrowService;
        this.tradesRepository = tradesRepository;
        this.restTemplate = restTemplate;
    }

    @PostMapping("/init/{tradeId}")
    public ResponseEntity<?> init(@PathVariable UUID tradeId) {
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
    public ResponseEntity<?> fund(@PathVariable UUID tradeId,
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
    public ResponseEntity<?> deliver(@PathVariable UUID tradeId) {
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
    public ResponseEntity<?> release(@PathVariable UUID tradeId,
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
    public ResponseEntity<?> refund(@PathVariable UUID tradeId) {
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
    public ResponseEntity<?> getStatus(@PathVariable UUID tradeId) {
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
        try {
            String url = "http://localhost:8080/api/notify";
            java.util.Map<String, Object> body = java.util.Map.of(
                    "userId", userId,
                    "type", type,
                    "message", message
            );
            restTemplate.postForEntity(url, body, String.class);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }
}
