package com.safetrade.safetradebackend.repository;

import com.safetrade.safetradebackend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UsersRepository extends JpaRepository<Users, UUID> {
}
