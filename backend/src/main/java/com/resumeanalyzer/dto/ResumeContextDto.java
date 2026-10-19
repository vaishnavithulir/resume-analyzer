package com.resumeanalyzer.dto;

import java.util.List;

public record ResumeContextDto(
        String candidateName,
        String targetJobTitle,
        Integer overallScore,
        List<String> matchedSkills,
        List<String> missingSkills,
        String resumeSnippet,
        String jobDescriptionSnippet
) {
    public static ResumeContextDto empty() {
        return new ResumeContextDto(
                "Candidate",
                "Software Engineer",
                0,
                List.of(),
                List.of(),
                "",
                ""
        );
    }
}
