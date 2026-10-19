package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.AuthResponse;
import com.resumeanalyzer.dto.LoginRequest;
import com.resumeanalyzer.dto.RegisterRequest;
import com.resumeanalyzer.entity.User;
import com.resumeanalyzer.exception.InvalidFileException;
import com.resumeanalyzer.repository.UserRepository;
import com.resumeanalyzer.security.JwtTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenService jwtTokenService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtTokenService);
    }

    @Test
    @DisplayName("Should successfully register a new user and return AuthResponse with JWT")
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest("john@example.com", "John Doe", "password123");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtTokenService.generateToken(anyString(), any())).thenReturn("mock.jwt.token");
        when(jwtTokenService.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.token());
        assertEquals("john@example.com", response.user().email());
        assertEquals("John Doe", response.user().fullName());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw InvalidFileException when registering an email that already exists")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("existing@example.com", "Jane Doe", "secret123");
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        InvalidFileException ex = assertThrows(InvalidFileException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("already exists"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully authenticate user when credentials are correct")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("user@example.com", "mypassword");
        User user = new User("user@example.com", "Test User", "encodedSecret", "ROLE_USER");
        user.setId(5L);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("mypassword", "encodedSecret")).thenReturn(true);
        when(jwtTokenService.generateToken(anyString(), any())).thenReturn("login.jwt.token");
        when(jwtTokenService.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("login.jwt.token", response.token());
        assertEquals("Test User", response.user().fullName());
    }

    @Test
    @DisplayName("Should reject login when password does not match")
    void testLoginInvalidPassword() {
        LoginRequest request = new LoginRequest("user@example.com", "wrongpassword");
        User user = new User("user@example.com", "Test User", "encodedSecret", "ROLE_USER");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "encodedSecret")).thenReturn(false);

        InvalidFileException ex = assertThrows(InvalidFileException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("Invalid email or password"));
    }
}
