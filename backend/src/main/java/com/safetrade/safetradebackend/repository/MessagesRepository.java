package com.safetrade.safetradebackend.repository;

import com.safetrade.safetradebackend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MessagesRepository extends JpaRepository<Message, UUID> {
    List<Message> findByTradeIdOrderBySentAtAsc(String tradeId);
}