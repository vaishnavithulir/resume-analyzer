package com.resumeanalyzer.dto;

public record ScoreBreakdown(
        int overallScore,
        double technicalScore,
        double softSkillsScore,
        double keywordRelevanceScore,
        String verdict,
        String rubricSummary
) {
}
