package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.*;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.exception.InvalidFileException;
import com.resumeanalyzer.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Registers a new candidate account.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful. Welcome aboard!", response));
    }

    /**
     * Signs in an existing user with email and password.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Sign in successful.", response));
    }

    /**
     * Retrieves the profile of the currently authenticated candidate.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getProfile() {
        User currentUser = authService.getCurrentUser()
                .orElseThrow(() -> new org.springframework.security.authentication.InsufficientAuthenticationException("Not authenticated. Please sign in to view your profile."));

        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", UserDto.fromEntity(currentUser)));
    }
}
