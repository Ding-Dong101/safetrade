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

    private final UsersRepository usersRepository;

    private final com.safetrade.safetradebackend.security.JwtService jwtService;

    public UsersController(UsersRepository usersRepository, com.safetrade.safetradebackend.security.JwtService jwtService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
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
        for (Users user1 : usersRepository.findAll()) {
            if (user1.getUsername().equals(user.getUsername()) && user1.getPassword().equals(user.getPassword())) {
                return ResponseEntity.ok(buildAuthResponse(user1));
            }
        }
        return ResponseEntity.status(401).body(java.util.Map.of("error", "Invalid username or password"));
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

    @PostMapping("/topup")
    public ResponseEntity<?> topUpWallet(@RequestBody java.util.Map<String, Double> body, java.security.Principal principal) {
        if(principal == null) return ResponseEntity.status(401).build();
        Double amount = body.get("amount");
        if(amount == null || amount <= 0) return ResponseEntity.badRequest().body("Invalid amount");

        for(Users user : usersRepository.findAll()) {
            if(user.getUsername().equals(principal.getName())) {
                user.setBalance((user.getBalance() == null ? 0.0 : user.getBalance()) + amount);
                usersRepository.save(user);
                return ResponseEntity.ok(buildAuthResponse(user).getUser());
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
