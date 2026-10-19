package com.resumeanalyzer.dto;

public record FullAnalysisResponse(
        MatchAnalysisResponse matchAnalysis,
        AiAdviceResponse aiAdvice
) {
}
