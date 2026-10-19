package com.resumeanalyzer.dto;

import java.time.Instant;

public record AnalysisSummaryDto(
        Long id,
        String candidateName,
        String targetJobTitle,
        int overallScore,
        double technicalScore,
        String verdict,
        int matchedCount,
        int missingCount,
        Instant createdAt
) {
}
