package com.resumeanalyzer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.*;
import com.resumeanalyzer.exception.GlobalExceptionHandler;
import com.resumeanalyzer.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = ResumeAnalysisController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class},
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.resumeanalyzer.config.SecurityConfig.class))
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class ResumeAnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ScoringEngineService scoringEngineService;

    @MockBean
    private ResumeParserService resumeParserService;

    @MockBean
    private AiAdvisorService aiAdvisorService;

    @MockBean
    private AnalysisHistoryService historyService;

    @Test
    @DisplayName("Should return 200 OK with match analysis when valid JSON request is submitted")
    void testAnalyzeMatchSuccess() throws Exception {
        AnalyzeMatchRequest request = new AnalyzeMatchRequest(
                "Candidate resume with Java, Spring Boot, MySQL, and Docker experience.",
                "Seeking backend software engineer with skills in Java, Spring Boot, and MySQL."
        );

        ScoreBreakdown mockScore = new ScoreBreakdown(
                85, 60.0, 10.0, 15.0, "Strong Candidate Match", "Rubric summary"
        );
        SkillMatchBreakdown mockSkills = new SkillMatchBreakdown(
                Collections.emptyList(), Collections.emptyList(), Collections.emptyList()
        );
        MatchAnalysisResponse mockResponse = new MatchAnalysisResponse(
                mockScore, mockSkills, 3, 4, 3, 0
        );

        when(scoringEngineService.analyzeMatch(anyString(), anyString())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/resumes/analyze-match")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.score.overallScore").value(85))
                .andExpect(jsonPath("$.data.matchedCount").value(3));
    }

    @Test
    @DisplayName("Should return 200 OK with AI recommendations when /ai-advice is requested")
    void testAiAdviceEndpoint() throws Exception {
        AnalyzeMatchRequest request = new AnalyzeMatchRequest(
                "Candidate resume with Java and Spring Boot experience.",
                "Seeking backend software engineer with skills in Java and Docker."
        );

        MatchAnalysisResponse mockMatch = new MatchAnalysisResponse(
                new ScoreBreakdown(70, 40.0, 15.0, 15.0, "Good Match", "Summary"),
                new SkillMatchBreakdown(Collections.emptyList(), Collections.emptyList(), Collections.emptyList()),
                2, 2, 1, 1
        );

        AiAdviceResponse mockAdvice = new AiAdviceResponse(
                "Impactful professional summary.",
                List.of(new BulletImprovement("Old bullet", "New bullet", "Rationale")),
                List.of(new SkillRecommendation("Docker", "Cloud & DevOps", "Project tip")),
                List.of("Strong Java background"),
                List.of("Add containerization"),
                "RULE_BASED_FALLBACK"
        );

        when(scoringEngineService.analyzeMatch(anyString(), anyString())).thenReturn(mockMatch);
        when(aiAdvisorService.generateAdvice(anyString(), anyString(), any())).thenReturn(mockAdvice);

        mockMvc.perform(post("/api/v1/resumes/ai-advice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.advisorySource").value("RULE_BASED_FALLBACK"))
                .andExpect(jsonPath("$.data.professionalSummarySuggestion").isNotEmpty());
    }

    @Test
    @DisplayName("Should return 200 OK with unified full analysis when /analyze-full is requested")
    void testAnalyzeFullEndpoint() throws Exception {
        AnalyzeMatchRequest request = new AnalyzeMatchRequest(
                "Candidate resume with Java, Spring Boot, and MySQL experience.",
                "Seeking backend engineer with skills in Java, Spring Boot, MySQL, and Docker."
        );

        MatchAnalysisResponse mockMatch = new MatchAnalysisResponse(
                new ScoreBreakdown(80, 50.0, 15.0, 15.0, "Strong Match", "Summary"),
                new SkillMatchBreakdown(Collections.emptyList(), Collections.emptyList(), Collections.emptyList()),
                4, 3, 3, 1
        );

        AiAdviceResponse mockAdvice = new AiAdviceResponse(
                "Summary suggestion", Collections.emptyList(), Collections.emptyList(),
                List.of("Strengths"), List.of("Improvements"), "RULE_BASED_FALLBACK"
        );

        when(scoringEngineService.analyzeMatch(anyString(), anyString())).thenReturn(mockMatch);
        when(aiAdvisorService.generateAdvice(anyString(), anyString(), any())).thenReturn(mockAdvice);

        mockMvc.perform(post("/api/v1/resumes/analyze-full")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.matchAnalysis.score.overallScore").value(80))
                .andExpect(jsonPath("$.data.aiAdvice.professionalSummarySuggestion").value("Summary suggestion"));
    }

    @Test
    @DisplayName("Should return 400 Bad Request when resumeText is too short or blank")
    void testAnalyzeMatchValidationFailure() throws Exception {
        AnalyzeMatchRequest invalidRequest = new AnalyzeMatchRequest(
                "Too short",
                "Valid job description with enough characters to pass validation test."
        );

        mockMvc.perform(post("/api/v1/resumes/analyze-match")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    @DisplayName("Should return 200 OK when analyzing uploaded file directly with job description")
    void testAnalyzeFileSuccess() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf", "dummy pdf content".getBytes());

        ResumeTextExtractionResponse extraction = new ResumeTextExtractionResponse(
                "resume.pdf", "application/pdf", 100L, 50, 300, "Extracted text content with Java and Spring", "Snippet..."
        );

        ScoreBreakdown mockScore = new ScoreBreakdown(75, 50.0, 10.0, 15.0, "Good Match", "Explanation");
        MatchAnalysisResponse mockResponse = new MatchAnalysisResponse(
                mockScore, new SkillMatchBreakdown(Collections.emptyList(), Collections.emptyList(), Collections.emptyList()),
                2, 2, 2, 0
        );

        when(resumeParserService.parseResume(any())).thenReturn(extraction);
        when(scoringEngineService.analyzeMatch(anyString(), anyString())).thenReturn(mockResponse);

        mockMvc.perform(multipart("/api/v1/resumes/analyze-file")
                        .file(file)
                        .param("jobDescription", "Software engineer required with Java and Spring Boot experience."))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.score.overallScore").value(75));
    }
}
