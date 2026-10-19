package com.resumeanalyzer.dto;

public record ChatMessageDto(
        String role,
        String content
) {
    public static ChatMessageDto user(String content) {
        return new ChatMessageDto("user", content);
    }

    public static ChatMessageDto assistant(String content) {
        return new ChatMessageDto("assistant", content);
    }
}
