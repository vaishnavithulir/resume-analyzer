package com.resumeanalyzer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ChatRequest(
        @NotBlank(message = "Message must not be empty.")
        @Size(max = 2000, message = "Message must not exceed 2000 characters.")
        String message,

        List<ChatMessageDto> conversationHistory,

        ResumeContextDto context
) {
}
