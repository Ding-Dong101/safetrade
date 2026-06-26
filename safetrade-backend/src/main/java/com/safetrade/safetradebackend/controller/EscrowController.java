package com.safetrade.safetradebackend.controller;

import com.safetrade.safetradebackend.service.EscrowService;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/escrow")
public class EscrowController {
    private final EscrowService escrowService;

    public EscrowController(EscrowService escrowService) {
        this.escrowService = escrowService;
    }

    @PostMapping("/fund/{tradeId}")
    public String fund(@PathVariable UUID tradeId,
                       @RequestParam String buyerEmail,
                       @RequestParam Double amount) {
        return escrowService.fundEscrow(tradeId, buyerEmail, amount);
    }

    @PatchMapping("/deliver/{tradeId}")
    public String deliver(@PathVariable UUID tradeId) {
        escrowService.markDelivered(tradeId);
        return "Trade " + tradeId + " marked as DELIVERED";
    }

    @PostMapping("/release/{tradeId}")
    public String release(@PathVariable UUID tradeId,
                          @RequestParam String recipientCode,
                          @RequestParam Double amount) {
        return escrowService.releaseFunds(tradeId, recipientCode, amount);
    }

    @PostMapping("/refund/{reference}")
    public String refund(@PathVariable String reference) {
        return escrowService.refundBuyer(reference);
    }
}
