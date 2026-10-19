package com.resumeanalyzer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnalyzeMatchRequest(
        @NotBlank(message = "Resume text cannot be blank.")
        @Size(min = 20, message = "Resume text must be at least 20 characters.")
        String resumeText,

        @NotBlank(message = "Job description cannot be blank.")
        @Size(min = 20, message = "Job description must be at least 20 characters.")
        String jobDescription
) {
}
