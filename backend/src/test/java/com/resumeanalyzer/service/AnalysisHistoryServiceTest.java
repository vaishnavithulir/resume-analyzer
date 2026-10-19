package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.*;
import com.resumeanalyzer.entity.AnalysisRecord;
import com.resumeanalyzer.exception.InvalidFileException;
import com.resumeanalyzer.model.SkillCategory;
import com.resumeanalyzer.model.SkillItem;
import com.resumeanalyzer.repository.AnalysisRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalysisHistoryServiceTest {

    @Mock
    private AnalysisRecordRepository repository;

    @Mock
    private AuthService authService;

    private AnalysisHistoryService historyService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        historyService = new AnalysisHistoryService(repository, objectMapper, authService);
    }

    @Test
    @DisplayName("Should successfully persist full analysis report to database")
    void testSaveAnalysis() {
        ScoreBreakdown score = new ScoreBreakdown(80, 50.0, 15.0, 15.0, "Strong Match", "Summary");
        SkillMatchBreakdown skills = new SkillMatchBreakdown(
                List.of(new SkillItem("Java", SkillCategory.LANGUAGES)),
                List.of(new SkillItem("Docker", SkillCategory.CLOUD_DEVOPS)),
                Collections.emptyList()
        );
        MatchAnalysisResponse match = new MatchAnalysisResponse(score, skills, 2, 1, 1, 1);
        AiAdviceResponse advice = new AiAdviceResponse(
                "Summary", Collections.emptyList(), Collections.emptyList(),
                List.of("Strength"), List.of("Improvement"), "RULE_BASED_FALLBACK"
        );
        FullAnalysisResponse fullAnalysis = new FullAnalysisResponse(match, advice);

        when(repository.save(any(AnalysisRecord.class))).thenAnswer(invocation -> {
            AnalysisRecord r = invocation.getArgument(0);
            r.setId(101L);
            return r;
        });

        AnalysisRecord saved = historyService.saveAnalysis("John Doe", "Junior Java Developer", fullAnalysis);

        assertNotNull(saved);
        assertEquals(101L, saved.getId());
        assertEquals("John Doe", saved.getCandidateName());
        assertEquals(80, saved.getOverallScore());
        verify(repository, times(1)).save(any(AnalysisRecord.class));
    }

    @Test
    @DisplayName("Should return paginated analysis summaries")
    void testGetHistory() {
        AnalysisRecord r = new AnalysisRecord();
        r.setId(1L);
        r.setCandidateName("Alice");
        r.setTargetJobTitle("Full Stack Dev");
        r.setOverallScore(75);
        r.setVerdict("Good Match");
        r.setMatchedSkillsJson("[]");
        r.setMissingSkillsJson("[]");

        Page<AnalysisRecord> page = new PageImpl<>(List.of(r));
        when(repository.findAllByOrderByCreatedAtDesc(any(Pageable.class))).thenReturn(page);

        Page<AnalysisSummaryDto> result = historyService.getHistory(0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("Alice", result.getContent().get(0).candidateName());
    }

    @Test
    @DisplayName("Should throw InvalidFileException when record by ID is not found")
    void testGetAnalysisByIdNotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(InvalidFileException.class, () -> historyService.getAnalysisById(999L));
    }
}
