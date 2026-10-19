package com.resumeanalyzer.dto;

public record MatchAnalysisResponse(
        ScoreBreakdown score,
        SkillMatchBreakdown skills,
        int jobSkillsCount,
        int resumeSkillsCount,
        int matchedCount,
        int missingCount
) {
}
