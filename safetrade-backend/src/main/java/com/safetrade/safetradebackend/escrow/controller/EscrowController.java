package com.safetrade.safetradebackend.escrow.controller;

import com.safetrade.safetradebackend.escrow.service.EscrowService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/escrow")
public class EscrowController {
    private final EscrowService escrowService;

    public EscrowController(EscrowService escrowService) {
        this.escrowService = escrowService;
    }

    @PostMapping("/fund/{tradeId}")
    public String fund(@PathVariable Long tradeId,
                       @RequestParam String buyerEmail,
                       @RequestParam Double amount) {
        return escrowService.fundEscrow(tradeId, buyerEmail, amount);
    }

    @PatchMapping("/deliver/{tradeId}")
    public String deliver(@PathVariable Long tradeId) {
        escrowService.markDelivered(tradeId);
        return "Trade " + tradeId + " marked as DELIVERED";
    }

    @PostMapping("/release/{tradeId}")
    public String release(@PathVariable Long tradeId,
                          @RequestParam String recipientCode,
                          @RequestParam Double amount) {
        return escrowService.releaseFunds(tradeId, recipientCode, amount);
    }

    @PostMapping("/refund/{reference}")
    public String refund(@PathVariable String reference) {
        return escrowService.refundBuyer(reference);
    }
}
