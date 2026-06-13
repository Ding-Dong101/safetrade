package com.safetrade.safetradebackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table
public class EscrowState {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

//    foreign key for the trade entity
    @OneToOne
    @JoinColumn(name = "trade_id", nullable = false)
    private Trades trade;

    // enum for the trade status
    @Enumerated(EnumType.STRING)
    private TradeState status = TradeState.PENDING;

    // Your verification codes
    private String dispatchCode;
    private String dropoffCode;
    private String releaseCode;

    // Used for your 24-hour and 72-hour limits
    private LocalDateTime timerDeadline;

    // --- SPRING BOOT MAGIC --- //

    // Spring will automatically set this to the exact second the row is created
    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    // Spring will automatically update this every time a code or status changes
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Getters and Setters down here...
}