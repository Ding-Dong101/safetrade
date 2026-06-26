package com.safetrade.safetradebackend.controller;

import com.safetrade.safetradebackend.model.Users;
import com.safetrade.safetradebackend.repository.UsersRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v2/users")
public class UsersController {

    //    calling the users repository
    private final UsersRepository usersRepository;

    public UsersController(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }
    //    the various API's

    @PostMapping("/register")
    public Users createUser(@RequestBody Users user) {
        Users newUser = new Users();
        newUser.setUsername(user.getUsername());
        newUser.setFirstname(user.getFirstname());
        newUser.setLastname(user.getLastname());
        newUser.setPassword(user.getPassword());
        newUser.setEmail(user.getEmail());

        return usersRepository.save(newUser);

    }

//    GETTING A PARTICULAR CUSTOMER BY NAME OR ID
    @GetMapping("/get/{id}")
    public Users getUser(@PathVariable UUID id) {
        for(Users user : usersRepository.findAll()) {
            if(user.getId().equals(id)) {
                return user;
            }
        }
        return null;
    }
//    GETTING A PARTICULAR CUSTOMER BY NAME
@GetMapping("/get/{username}")
public Users getUser(@PathVariable String username) {
    for(Users user : usersRepository.findAll()) {
        if(user.getUsername().equals(username)) {
            return user;
        }
    }
    return null;
}
//    GETTING ALL THE CUSTOMERS
    @GetMapping("/all")
    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }

    @PostMapping("/login")
    public Users login(@RequestBody Users user) {
        for (Users user1 : usersRepository.findAll()) {
            if (user1.getUsername().equals(user.getUsername()) && user.getPassword().equals(user.getPassword())) {
                return user1;
            }else {
                throw new RuntimeException("Invalid username or password");
            }
        }
        return user;
    }
}
