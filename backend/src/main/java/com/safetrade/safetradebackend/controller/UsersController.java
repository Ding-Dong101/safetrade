package com.safetrade.safetradebackend.controller;

import com.safetrade.safetradebackend.model.AuthResponse;
import com.safetrade.safetradebackend.model.Users;
import com.safetrade.safetradebackend.repository.UsersRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@CrossOrigin
@RestController
@RequestMapping({"/api/v2/users", "/api/users", "/api/auth"})
public class UsersController {
    
    private final java.util.Set<String> processedTopUps = new java.util.concurrent.ConcurrentHashMap<String, Boolean>().keySet(true);

    private final UsersRepository usersRepository;
    private final com.safetrade.safetradebackend.security.JwtService jwtService;
    private final com.safetrade.safetradebackend.service.EscrowService escrowService;

    public UsersController(UsersRepository usersRepository, com.safetrade.safetradebackend.security.JwtService jwtService, com.safetrade.safetradebackend.service.EscrowService escrowService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.escrowService = escrowService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> createUser(@RequestBody Users user) {
        Users newUser = new Users();
        newUser.setUsername(user.getUsername());
        newUser.setFirstname(user.getFirstname());
        newUser.setLastname(user.getLastname());
        newUser.setPassword(user.getPassword());
        newUser.setEmail(user.getEmail());
        newUser.setBalance(0.0);

        Users saved = usersRepository.save(newUser);
        return ResponseEntity.status(201).body(buildAuthResponse(saved));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Users user) {
        String inputStr = user.getUsername() != null ? user.getUsername().trim() : "";
        for (Users user1 : usersRepository.findAll()) {
            boolean matchesUsername = user1.getUsername() != null && user1.getUsername().equalsIgnoreCase(inputStr);
            boolean matchesEmail = user1.getEmail() != null && user1.getEmail().equalsIgnoreCase(inputStr);
            
            if ((matchesUsername || matchesEmail) && user1.getPassword().equals(user.getPassword())) {
                return ResponseEntity.ok(buildAuthResponse(user1));
            }
        }
        return ResponseEntity.status(401).body(java.util.Map.of("error", "Invalid username/email or password"));
    }

    @GetMapping({"/{id}", "/get/id/{id}"})
    public ResponseEntity<Users> getUser(@PathVariable UUID id) {
        return usersRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/get/username/{username}")
    public ResponseEntity<Users> getUserByUsername(@PathVariable String username) {
        for(Users user : usersRepository.findAll()) {
            if(user.getUsername().equals(username)) {
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/all")
    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }

    @PostMapping("/push-token")
    public ResponseEntity<?> updatePushToken(@RequestBody java.util.Map<String, String> body, java.security.Principal principal) {
        if(principal == null) return ResponseEntity.status(401).build();
        String pushToken = body.get("pushToken");
        for(Users user : usersRepository.findAll()) {
            if(user.getUsername().equals(principal.getName())) {
                user.setPushToken(pushToken);
                usersRepository.save(user);
                return ResponseEntity.ok().build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/topup/initialize")
    public ResponseEntity<?> initializeTopUp(@RequestBody java.util.Map<String, Double> body, java.security.Principal principal) {
        if(principal == null) return ResponseEntity.status(401).build();
        Double amount = body.get("amount");
        if(amount == null || amount <= 0) return ResponseEntity.badRequest().body("Invalid amount");

        for(Users user : usersRepository.findAll()) {
            if(user.getUsername().equals(principal.getName())) {
                String paystackResponse = escrowService.initializeTopUp(user.getEmail(), amount);
                return ResponseEntity.ok(paystackResponse);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/topup/verify")
    public ResponseEntity<?> verifyTopUp(@RequestBody java.util.Map<String, String> body, java.security.Principal principal) {
        if(principal == null) return ResponseEntity.status(401).build();
        String reference = body.get("reference");
        if(reference == null || reference.isEmpty()) return ResponseEntity.badRequest().body("Reference is required");

        if (processedTopUps.contains(reference)) {
            return ResponseEntity.badRequest().body("Transaction already processed");
        }

        Double paidAmount = escrowService.verifyTopUpPayment(reference, 100.0);
        if (paidAmount == null) {
            return ResponseEntity.badRequest().body("Payment could not be verified");
        }

        for(Users user : usersRepository.findAll()) {
            if(user.getUsername().equals(principal.getName())) {
                user.setBalance((user.getBalance() == null ? 0.0 : user.getBalance()) + paidAmount);
                usersRepository.save(user);
                processedTopUps.add(reference);
                return ResponseEntity.ok(buildAuthResponse(user).getUser());
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/bank-details")
    public ResponseEntity<?> updateBankDetails(@RequestBody java.util.Map<String, String> body, java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();

        String name = body.get("name");
        String accountNumber = body.get("accountNumber");
        String bankCode = body.get("bankCode");

        if (name == null || accountNumber == null || bankCode == null) {
            return ResponseEntity.badRequest().body("name, accountNumber, and bankCode are required");
        }

        String recipientCode = escrowService.createTransferRecipient(name, accountNumber, bankCode);
        if (recipientCode == null) {
            return ResponseEntity.internalServerError().body("Failed to create Paystack transfer recipient");
        }

        for (Users user : usersRepository.findAll()) {
            if (user.getUsername().equals(principal.getName())) {
                user.setPaystackRecipientCode(recipientCode);
                user.setPaymentName(name);
                user.setPaymentNumber(accountNumber);
                user.setPaymentNetwork(bankCode);
                usersRepository.save(user);
                
                AuthResponse.UserDto userDto = buildAuthResponse(user).getUser();
                return ResponseEntity.ok(java.util.Map.of("message", "Bank details updated successfully", "recipientCode", recipientCode, "user", userDto));
            }
        }
        return ResponseEntity.notFound().build();
    }

    private AuthResponse buildAuthResponse(Users user) {
        org.springframework.security.core.userdetails.UserDetails userDetails = 
            org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
            .password(user.getPassword())
            .authorities(new java.util.ArrayList<>())
            .build();
            
        String token = jwtService.generateToken(userDetails);
        
        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstname())
                .lastName(user.getLastname())
                .username(user.getUsername())
                .email(user.getEmail())
                .isAdmin(false)
                .balance(user.getBalance())
                .paymentName(user.getPaymentName())
                .paymentNumber(user.getPaymentNumber())
                .paymentNetwork(user.getPaymentNetwork())
                .createdAt(java.time.LocalDateTime.now().toString())
                .build();

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getFirstname() + " " + user.getLastname())
                .user(userDto)
                .build();
    }
}
