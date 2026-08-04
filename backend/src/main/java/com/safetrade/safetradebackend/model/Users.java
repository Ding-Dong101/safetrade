package com.safetrade.safetradebackend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table
@NoArgsConstructor @AllArgsConstructor

public class Users {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @Column(unique = true,nullable = false)
    private String username;

    @Column(nullable = false)
    private String firstname;

    @Column(nullable = false)
    private String lastname;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, columnDefinition = "float8 default 0.0")
    private Double balance = 0.0;

    @Column
    private String pushToken;

    @Column
    private String paystackRecipientCode;

    @Column
    private String paymentName;

    @Column
    private String paymentNumber;

    @Column
    private String paymentNetwork;

    @Column
    private String phone;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean isVerified = false;

    @Column
    private String idType; // e.g. "GHANA_CARD", "PASSPORT", "VOTER_ID"

    @Column
    private String idNumber;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean isSellerApproved = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean isRiderApproved = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean isPostApproved = false;

    @Column
    private String sellerCode;

    @Column
    private String riderCode;

    @Column
    private String postCode;

    @ManyToMany
    private List<Trades> trades;
}
