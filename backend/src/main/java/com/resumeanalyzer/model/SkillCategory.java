package com.resumeanalyzer.model;

public enum SkillCategory {
    LANGUAGES("Programming Languages"),
    FRAMEWORKS("Frameworks & Libraries"),
    DATABASES("Databases & Storage"),
    CLOUD_DEVOPS("Cloud & DevOps"),
    ENGINEERING_CONCEPTS("Software Engineering & Architecture"),
    SOFT_SKILLS("Soft Skills & Collaboration");

    private final String displayName;

    SkillCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
