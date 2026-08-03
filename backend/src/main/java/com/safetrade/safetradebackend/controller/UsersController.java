package com.safetrade.safetradebackend.controller;

import com.safetrade.safetradebackend.model.AuthResponse;
import com.safetrade.safetradebackend.model.Users;
import com.safetrade.safetradebackend.repository.UsersRepository;
import com.safetrade.safetradebackend.service.EmailOtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin
@RestController
@RequestMapping({"/api/v2/users", "/api/users", "/api/auth"})
public class UsersController {
    
    private final java.util.Set<String> processedTopUps = new java.util.concurrent.ConcurrentHashMap<String, Boolean>().keySet(true);

    private final UsersRepository usersRepository;
    private final com.safetrade.safetradebackend.security.JwtService jwtService;
    private final com.safetrade.safetradebackend.service.EscrowService escrowService;
    private final EmailOtpService emailOtpService;

    public UsersController(UsersRepository usersRepository, com.safetrade.safetradebackend.security.JwtService jwtService, com.safetrade.safetradebackend.service.EscrowService escrowService, EmailOtpService emailOtpService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
        this.escrowService = escrowService;
        this.emailOtpService = emailOtpService;
    }

    /** Sends a 6-digit OTP to the provided email. Call this BEFORE account creation. */
    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank() || !email.contains("@")) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "A valid email address is required."));
        }
        try {
            emailOtpService.sendOtp(email.trim().toLowerCase());
            return ResponseEntity.ok(java.util.Map.of("message", "Verification code sent to " + email));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /** Verifies the OTP. Returns 200 if valid, 400 if wrong/expired. */
    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "email and otp are required"));
        }
        boolean valid = emailOtpService.verifyOtp(email.trim().toLowerCase(), otp.trim());
        if (valid) {
            return ResponseEntity.ok(java.util.Map.of("verified", true));
        }
        return ResponseEntity.status(400).body(java.util.Map.of("error", "Invalid or expired verification code."));
    }

    @PostMapping("/register")

    public ResponseEntity<?> createUser(@RequestBody Users user) {
        for (Users existing : usersRepository.findAll()) {
            if (existing.getUsername() != null && existing.getUsername().equalsIgnoreCase(user.getUsername())) {
                return ResponseEntity.status(400).body(java.util.Map.of("error", "Username already exists"));
            }
            if (user.getEmail() != null && !user.getEmail().isEmpty() && existing.getEmail() != null && existing.getEmail().equalsIgnoreCase(user.getEmail())) {
                return ResponseEntity.status(400).body(java.util.Map.of("error", "Email already exists"));
            }
        }

        Users newUser = new Users();
        newUser.setUsername(user.getUsername());
        newUser.setFirstname(user.getFirstname());
        newUser.setLastname(user.getLastname());
        newUser.setPassword(user.getPassword());
        newUser.setPhone(user.getPhone());
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            newUser.setEmail(user.getUsername() + "@phone.local");
        } else {
            newUser.setEmail(user.getEmail());
        }
        newUser.setBalance(0.0);
        newUser.setIsVerified(false);
        newUser.setIsRiderApproved(false);
        newUser.setIsPostApproved(false);

        try {
            Users saved = usersRepository.save(newUser);
            return ResponseEntity.status(201).body(buildAuthResponse(saved));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(java.util.Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Users user) {
        String inputStr = user.getUsername() != null ? user.getUsername().trim() : "";
        for (Users user1 : usersRepository.findAll()) {
            boolean matchesUsername = user1.getUsername() != null && user1.getUsername().equalsIgnoreCase(inputStr);
            boolean matchesEmail = user1.getEmail() != null && user1.getEmail().equalsIgnoreCase(inputStr);
            
            if ((matchesUsername || matchesEmail) && user.getPassword() != null && user.getPassword().equals(user1.getPassword())) {
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

    /** Submits identity verification (e.g., Ghana Card, Passport). */
    @PostMapping("/verify-account")
    public ResponseEntity<?> verifyAccount(@RequestBody java.util.Map<String, String> body, java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
        }
        String idType = body.get("idType");
        String idNumber = body.get("idNumber");

        if (idType == null || idNumber == null || idType.isBlank() || idNumber.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "idType and idNumber are required"));
        }

        Optional<Users> userOpt = usersRepository.findByUsername(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Users user = userOpt.get();
        user.setIdType(idType.trim().toUpperCase());
        user.setIdNumber(idNumber.trim());
        user.setIsVerified(true);
        usersRepository.save(user);

        return ResponseEntity.ok(java.util.Map.of(
            "message", "Account verified successfully",
            "user", buildAuthResponse(user).getUser()
        ));
    }

    /** Request approval to access Rider or Post portals. */
    @PostMapping("/request-role")
    public ResponseEntity<?> requestRole(@RequestBody java.util.Map<String, String> body, java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("error", "Unauthorized"));
        }
        String targetRole = body.get("role");
        if (targetRole == null || (!targetRole.equalsIgnoreCase("rider") && !targetRole.equalsIgnoreCase("post"))) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Role must be 'rider' or 'post'"));
        }

        Optional<Users> userOpt = usersRepository.findByUsername(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Users user = userOpt.get();
        if (targetRole.equalsIgnoreCase("rider")) {
            user.setIsRiderApproved(true);
        } else {
            user.setIsPostApproved(true);
        }
        usersRepository.save(user);

        return ResponseEntity.ok(java.util.Map.of(
            "message", "Role " + targetRole + " approved",
            "user", buildAuthResponse(user).getUser()
        ));
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
                .phone(user.getPhone())
                .isAdmin(false)
                .balance(user.getBalance())
                .paymentName(user.getPaymentName())
                .paymentNumber(user.getPaymentNumber())
                .paymentNetwork(user.getPaymentNetwork())
                .isVerified(Boolean.TRUE.equals(user.getIsVerified()))
                .idType(user.getIdType())
                .idNumber(user.getIdNumber())
                .isRiderApproved(Boolean.TRUE.equals(user.getIsRiderApproved()))
                .isPostApproved(Boolean.TRUE.equals(user.getIsPostApproved()))
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
