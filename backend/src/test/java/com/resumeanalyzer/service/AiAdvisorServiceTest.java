package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.*;
import com.resumeanalyzer.model.SkillCategory;
import com.resumeanalyzer.model.SkillItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AiAdvisorServiceTest {

    private AiAdvisorService aiAdvisorService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        aiAdvisorService = new AiAdvisorService(objectMapper);
    }

    @Test
    @DisplayName("Should generate structured rule-based advisory feedback when no LLM API key is configured")
    void testFallbackAdviceGeneration() {
        MatchAnalysisResponse mockMatch = createMockMatchResponse(
                List.of(new SkillItem("Java", SkillCategory.LANGUAGES), new SkillItem("Spring Boot", SkillCategory.FRAMEWORKS)),
                List.of(new SkillItem("Docker", SkillCategory.CLOUD_DEVOPS), new SkillItem("AWS", SkillCategory.CLOUD_DEVOPS))
        );

        AiAdviceResponse advice = aiAdvisorService.generateAdvice(
                "Resume with Java and Spring Boot experience.",
                "Job seeking Java, Spring Boot, Docker, and AWS.",
                mockMatch
        );

        assertNotNull(advice);
        assertEquals("RULE_BASED_FALLBACK", advice.advisorySource());
        assertNotNull(advice.professionalSummarySuggestion());
        assertTrue(advice.professionalSummarySuggestion().contains("Java"));

        // Verify bullet improvements
        assertFalse(advice.bulletImprovements().isEmpty());
        BulletImprovement firstBullet = advice.bulletImprovements().get(0);
        assertNotNull(firstBullet.improvedBullet());
        assertNotNull(firstBullet.rationale());

        // Verify skill recommendations provide project bridging tips for Docker & AWS
        assertFalse(advice.skillRecommendations().isEmpty());
        assertTrue(advice.skillRecommendations().stream().anyMatch(s -> s.skillName().equals("Docker")));
        assertTrue(advice.skillRecommendations().stream().anyMatch(s -> s.actionableAdvice().contains("Dockerfile")));
    }

    @Test
    @DisplayName("Should correctly parse Gemini LLM JSON response into structured AiAdviceResponse")
    void testParseGeminiApiResponse() {
        MatchAnalysisResponse mockMatch = createMockMatchResponse(List.of(), List.of());

        String geminiJson = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "{\\"professionalSummarySuggestion\\": \\"MCA Graduate and Backend Engineer specializing in Java microservices.\\", \\"bulletImprovements\\": [{\\"originalBullet\\": \\"Worked on API\\", \\"improvedBullet\\": \\"Architected 10+ RESTful APIs reducing latency by 30%%\\", \\"rationale\\": \\"Quantifies performance impact\\"}], \\"skillRecommendations\\": [{\\"skillName\\": \\"Kubernetes\\", \\"category\\": \\"Cloud & DevOps\\", \\"actionableAdvice\\": \\"Deploy microservices to Minikube\\"}], \\"keyStrengths\\": [\\"Strong core Java\\"], \\"criticalImprovements\\": [\\"Add containerization experience\\"]}"
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        AiAdviceResponse response = aiAdvisorService.parseGeminiResponse(
                geminiJson, "Resume text", "Job description", mockMatch);

        assertNotNull(response);
        assertEquals("GEMINI_LLM", response.advisorySource());
        assertEquals("MCA Graduate and Backend Engineer specializing in Java microservices.",
                response.professionalSummarySuggestion());
        assertEquals(1, response.bulletImprovements().size());
        assertEquals("Quantifies performance impact", response.bulletImprovements().get(0).rationale());
        assertEquals("Kubernetes", response.skillRecommendations().get(0).skillName());
    }

    private MatchAnalysisResponse createMockMatchResponse(List<SkillItem> matched, List<SkillItem> missing) {
        ScoreBreakdown score = new ScoreBreakdown(70, 40.0, 15.0, 15.0, "Good Match", "Summary");
        SkillMatchBreakdown skills = new SkillMatchBreakdown(matched, missing, List.of());
        return new MatchAnalysisResponse(score, skills, matched.size() + missing.size(), matched.size(), matched.size(), missing.size());
    }
}
