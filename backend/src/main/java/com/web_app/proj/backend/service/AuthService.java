package com.web_app.proj.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.web_app.proj.backend.config.JwtUtils;
import com.web_app.proj.backend.exception.BadRequestException;
import com.web_app.proj.backend.exception.UnauthorizedException;
import com.web_app.proj.backend.model.User;
import com.web_app.proj.backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwt;

    public AuthService(UserRepository repo, PasswordEncoder encoder, JwtUtils jwt) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public String register(String username, String password) {
        if (repo.existsByUsername(username)) {
            throw new BadRequestException("Username already taken");
        }

        User user = new User(username, encoder.encode(password));
        repo.save(user);

        return jwt.generateToken(username);
    }

    public String login(String username, String password) {
        User user = repo.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return jwt.generateToken(username);
    }

    public User me(String username) {
        return repo.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    public String extractUsername(String token) {
        return jwt.extractUsername(token);
    }

}
