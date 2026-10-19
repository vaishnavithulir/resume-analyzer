package com.resumeanalyzer.dto;

import java.util.List;

public record AiAdviceResponse(
        String professionalSummarySuggestion,
        List<BulletImprovement> bulletImprovements,
        List<SkillRecommendation> skillRecommendations,
        List<String> keyStrengths,
        List<String> criticalImprovements,
        String advisorySource
) {
}
