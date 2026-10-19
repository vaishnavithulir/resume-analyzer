package com.resumeanalyzer.dto;

import com.resumeanalyzer.entity.User;
import java.time.Instant;

public record UserDto(
        Long id,
        String email,
        String fullName,
        String role,
        Instant createdAt
) {
    public static UserDto fromEntity(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
