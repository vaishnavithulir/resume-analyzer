package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.MatchAnalysisResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ScoringEngineServiceTest {

    private ScoringEngineService scoringEngineService;

    @BeforeEach
    void setUp() {
        SkillExtractionService skillExtractionService = new SkillExtractionService(new ObjectMapper());
        skillExtractionService.initTaxonomy();
        scoringEngineService = new ScoringEngineService(skillExtractionService);
    }

    @Test
    @DisplayName("Should award high match score when resume matches all job requirements")
    void testPerfectSkillMatch() {
        String jobDescription = "Looking for a Software Engineer skilled in Java, Spring Boot, MySQL, and Docker with strong Communication.";
        String resumeText = "Experienced developer with expertise in Java, Spring Boot, MySQL, Docker, and excellent Communication skills.";

        MatchAnalysisResponse response = scoringEngineService.analyzeMatch(resumeText, jobDescription);

        assertNotNull(response);
        assertEquals(5, response.matchedCount());
        assertEquals(0, response.missingCount());
        assertTrue(response.score().overallScore() >= 85);
        assertEquals("Strong Candidate Match", response.score().verdict());
        assertTrue(response.score().technicalScore() >= 59.0);
    }

    @Test
    @DisplayName("Should detect missing skills and calculate proportionate score when candidate lacks requirements")
    void testPartialSkillMatch() {
        String jobDescription = "Senior Backend Engineer required. Must know Java, Spring Boot, Kubernetes, Kafka, and Redis.";
        // Candidate knows only Java and Spring Boot
        String resumeText = "Junior Developer with experience in Java and Spring Boot building web applications.";

        MatchAnalysisResponse response = scoringEngineService.analyzeMatch(resumeText, jobDescription);

        assertEquals(2, response.matchedCount());
        assertEquals(3, response.missingCount());

        // Technical score should be (2/5) * 60 = 24.0
        assertEquals(24.0, response.score().technicalScore(), 0.5);

        // Verify missing skills list contains Kubernetes, Kafka, Redis
        assertTrue(response.skills().missingSkills().stream().anyMatch(s -> s.name().equals("Kubernetes")));
        assertTrue(response.skills().missingSkills().stream().anyMatch(s -> s.name().equals("Kafka")));
        assertTrue(response.skills().missingSkills().stream().anyMatch(s -> s.name().equals("Redis")));
    }

    @Test
    @DisplayName("Should calculate additional bonus skills not listed in job description")
    void testAdditionalSkillsIdentified() {
        String jobDescription = "Hiring Python backend engineer proficient in Django and PostgreSQL.";
        String resumeText = "Full-stack engineer proficient in Python, Django, PostgreSQL, and also experienced with React and Docker.";

        MatchAnalysisResponse response = scoringEngineService.analyzeMatch(resumeText, jobDescription);

        assertEquals(3, response.matchedCount());
        assertEquals(0, response.missingCount());
        assertTrue(response.skills().additionalSkills().stream().anyMatch(s -> s.name().equals("React")));
        assertTrue(response.skills().additionalSkills().stream().anyMatch(s -> s.name().equals("Docker")));
    }
}
