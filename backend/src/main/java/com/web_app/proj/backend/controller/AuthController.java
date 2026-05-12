package com.web_app.proj.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.web_app.proj.backend.dto.UserDTO;
import com.web_app.proj.backend.mapper.UserMapper;
import com.web_app.proj.backend.model.User;
import com.web_app.proj.backend.repository.UserRepository;
import com.web_app.proj.backend.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService service;
    private final UserRepository userRepository;

    public AuthController(AuthService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public String register(@RequestParam String username, @RequestParam String password) {
        return service.register(username, password);
    }

    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password) {
        return service.login(username, password);
    }

    @GetMapping("/me")
    public UserDTO me(HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String username = service.extractUsername(token); // ou jwtUtils.extractUsername(token)

        User user = service.me(username);
        return UserMapper.toDTO(user);
    }


    @GetMapping("/all")
    public List<UserDTO> allUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toDTO)
                .toList();
    }
}
