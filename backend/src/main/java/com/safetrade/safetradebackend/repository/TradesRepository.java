package com.safetrade.safetradebackend.repository;
import com.safetrade.safetradebackend.model.Trades;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
public interface TradesRepository extends JpaRepository<Trades, UUID> {
    java.util.List<Trades> findByBuyerId(String buyerId);
    java.util.List<Trades> findBySellerId(String sellerId);
    Optional<Trades> findByTradeCode(String tradeCode);
    Optional<Trades> findByRiderCode(String riderCode);
    
}
