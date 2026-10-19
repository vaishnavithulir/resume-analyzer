package com.resumeanalyzer.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenServiceTest {

    private JwtTokenService jwtTokenService;

    @BeforeEach
    void setUp() {
        jwtTokenService = new JwtTokenService();
        // Use standard 256-bit test secret
        ReflectionTestUtils.setField(jwtTokenService, "secretKeyHex",
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtTokenService, "expirationMs", 3600000L); // 1 hour
    }

    @Test
    @DisplayName("Should generate a valid token and successfully extract the subject email")
    void testTokenGenerationAndExtraction() {
        String email = "candidate@example.com";
        String token = jwtTokenService.generateToken(email, Map.of("fullName", "John Doe"));

        assertNotNull(token);
        assertFalse(token.isBlank());

        String extractedEmail = jwtTokenService.extractEmail(token);
        assertEquals(email, extractedEmail);
        assertTrue(jwtTokenService.isTokenValid(token, email));
    }

    @Test
    @DisplayName("Should reject token when validated against an incorrect email")
    void testTokenInvalidEmail() {
        String token = jwtTokenService.generateToken("alice@example.com");

        assertFalse(jwtTokenService.isTokenValid(token, "bob@example.com"));
    }

    @Test
    @DisplayName("Should detect expired token correctly")
    void testExpiredToken() {
        // Set expirationMs to negative value to generate an immediately expired token
        ReflectionTestUtils.setField(jwtTokenService, "expirationMs", -1000L);
        String expiredToken = jwtTokenService.generateToken("expired@example.com");

        assertFalse(jwtTokenService.isTokenValid(expiredToken, "expired@example.com"));
    }
}
