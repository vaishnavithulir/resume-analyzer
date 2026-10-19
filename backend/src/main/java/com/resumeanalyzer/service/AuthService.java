package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.AuthResponse;
import com.resumeanalyzer.dto.LoginRequest;
import com.resumeanalyzer.dto.RegisterRequest;
import com.resumeanalyzer.dto.UserDto;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.exception.InvalidFileException;
import com.resumeanalyzer.repository.UserRepository;
import com.resumeanalyzer.security.JwtTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenService jwtTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    /**
     * Registers a new candidate account, hashes the password, and returns a JWT token.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new InvalidFileException("An account with email '" + normalizedEmail + "' already exists. Please sign in instead.");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setFullName(request.fullName().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("ROLE_USER");

        User savedUser = userRepository.save(user);
        log.info("Registered new user with ID: {} and email: {}", savedUser.getId(), savedUser.getEmail());

        String token = jwtTokenService.generateToken(savedUser.getEmail(), Map.of(
                "fullName", savedUser.getFullName(),
                "role", savedUser.getRole()
        ));

        return AuthResponse.of(token, jwtTokenService.getExpirationMs(), UserDto.fromEntity(savedUser));
    }

    /**
     * Authenticates an existing user and returns a signed JWT token.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new InvalidFileException("Invalid email or password. Please verify your credentials."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidFileException("Invalid email or password. Please verify your credentials.");
        }

        String token = jwtTokenService.generateToken(user.getEmail(), Map.of(
                "fullName", user.getFullName(),
                "role", user.getRole()
        ));

        log.info("User logged in successfully: {}", user.getEmail());
        return AuthResponse.of(token, jwtTokenService.getExpirationMs(), UserDto.fromEntity(user));
    }

    /**
     * Retrieves the currently authenticated user from Spring Security context, if any.
     */
    @Transactional(readOnly = true)
    public Optional<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return userRepository.findByEmail(auth.getName().trim().toLowerCase());
    }
}
