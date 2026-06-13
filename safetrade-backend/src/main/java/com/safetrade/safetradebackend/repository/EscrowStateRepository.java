package com.safetrade.safetradebackend.repository;

import com.safetrade.safetradebackend.model.EscrowState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EscrowStateRepository extends JpaRepository<EscrowState, UUID> {
}
