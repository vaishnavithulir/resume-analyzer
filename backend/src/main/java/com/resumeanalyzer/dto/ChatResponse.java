package com.resumeanalyzer.dto;

import java.time.Instant;

public record ChatResponse(
        String reply,
        String advisorySource,
        Instant timestamp
) {
    public static ChatResponse of(String reply, String advisorySource) {
        return new ChatResponse(reply, advisorySource, Instant.now());
    }
}
