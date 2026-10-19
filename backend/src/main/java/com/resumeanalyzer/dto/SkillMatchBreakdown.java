package com.resumeanalyzer.dto;

import com.resumeanalyzer.model.SkillItem;

import java.util.List;

public record SkillMatchBreakdown(
        List<SkillItem> matchedSkills,
        List<SkillItem> missingSkills,
        List<SkillItem> additionalSkills
) {
}
