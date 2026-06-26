package com.safetrade.safetradebackend.repository;

import com.safetrade.safetradebackend.model.Trades;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TradesRepository extends JpaRepository<Trades, UUID> {
}
