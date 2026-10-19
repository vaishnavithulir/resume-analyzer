package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.model.SkillCategory;
import com.resumeanalyzer.model.SkillItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class SkillExtractionServiceTest {

    private SkillExtractionService skillExtractionService;

    @BeforeEach
    void setUp() {
        skillExtractionService = new SkillExtractionService(new ObjectMapper());
        skillExtractionService.initTaxonomy();
    }

    @Test
    @DisplayName("Should extract standard software engineering skills from text")
    void testExtractStandardSkills() {
        String text = "Candidate with 2 years of experience in Java, Spring Boot, MySQL, and Docker.";
        Set<SkillItem> skills = skillExtractionService.extractSkills(text);

        assertTrue(skills.stream().anyMatch(s -> s.name().equals("Java") && s.category() == SkillCategory.LANGUAGES));
        assertTrue(skills.stream().anyMatch(s -> s.name().equals("Spring Boot") && s.category() == SkillCategory.FRAMEWORKS));
        assertTrue(skills.stream().anyMatch(s -> s.name().equals("MySQL") && s.category() == SkillCategory.DATABASES));
        assertTrue(skills.stream().anyMatch(s -> s.name().equals("Docker") && s.category() == SkillCategory.CLOUD_DEVOPS));
    }

    @Test
    @DisplayName("Should NOT extract Java when only JavaScript is present in text (Word Boundary Safety)")
    void testWordBoundarySafety() {
        String text = "Frontend engineer specialized in JavaScript, HTML, and CSS.";
        Set<SkillItem> skills = skillExtractionService.extractSkills(text);

        assertTrue(skills.stream().anyMatch(s -> s.name().equals("JavaScript")));
        assertFalse(skills.stream().anyMatch(s -> s.name().equals("Java")),
                "Java should NOT match within JavaScript!");
    }

    @Test
    @DisplayName("Should resolve skill aliases to canonical skill names")
    void testAliasResolution() {
        String text = "Hands-on experience deploying microservices with k8s, postgres, and reactjs using springboot.";
        Set<SkillItem> skills = skillExtractionService.extractSkills(text);

        assertTrue(skills.stream().anyMatch(s -> s.name().equals("Kubernetes")), "k8s should resolve to Kubernetes");
        assertTrue(skills.stream().anyMatch(s -> s.name().equals("PostgreSQL")), "postgres should resolve to PostgreSQL");
        assertTrue(skills.stream().anyMatch(s -> s.name().equals("React")), "reactjs should resolve to React");
        assertTrue(skills.stream().anyMatch(s -> s.name().equals("Spring Boot")), "springboot should resolve to Spring Boot");
    }

    @Test
    @DisplayName("Should safely handle punctuation and symbols in skills like C++, C#, and .NET")
    void testPunctuationAndSymbols() {
        String text = "Backend developer working with C++, C#, and REST APIs.";
        Set<SkillItem> skills = skillExtractionService.extractSkills(text);

        assertTrue(skills.stream().anyMatch(s -> s.name().equals("C++")));
        assertTrue(skills.stream().anyMatch(s -> s.name().equals("C#")));
        assertTrue(skills.stream().anyMatch(s -> s.name().equals("REST APIs")));
    }

    @Test
    @DisplayName("Should return empty set when text is empty or blank")
    void testEmptyText() {
        assertTrue(skillExtractionService.extractSkills("").isEmpty());
        assertTrue(skillExtractionService.extractSkills("   ").isEmpty());
        assertTrue(skillExtractionService.extractSkills(null).isEmpty());
    }
}
