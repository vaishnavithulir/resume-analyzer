package com.resumeanalyzer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.AnalysisSummaryDto;
import com.resumeanalyzer.dto.FullAnalysisResponse;
import com.resumeanalyzer.dto.MatchAnalysisResponse;
import com.resumeanalyzer.entity.AnalysisRecord;
import com.resumeanalyzer.exception.InvalidFileException;
import com.resumeanalyzer.repository.AnalysisRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalysisHistoryService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisHistoryService.class);

    private final AnalysisRecordRepository repository;
    private final ObjectMapper objectMapper;
    private final AuthService authService;

    public AnalysisHistoryService(AnalysisRecordRepository repository,
                                  ObjectMapper objectMapper,
                                  AuthService authService) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.authService = authService;
    }

    /**
     * Persists an analysis report session into the database and links to logged in user if present.
     */
    @Transactional
    public AnalysisRecord saveAnalysis(String candidateName, String jobTitle, FullAnalysisResponse fullAnalysis) {
        AnalysisRecord record = new AnalysisRecord();
        authService.getCurrentUser().ifPresent(record::setUser);
        record.setCandidateName((candidateName == null || candidateName.isBlank()) ? "Software Candidate" : candidateName.trim());
        record.setTargetJobTitle((jobTitle == null || jobTitle.isBlank()) ? "Software Engineer" : jobTitle.trim());

        MatchAnalysisResponse match = fullAnalysis.matchAnalysis();
        record.setOverallScore(match.score().overallScore());
        record.setTechnicalScore(match.score().technicalScore());
        record.setSoftSkillsScore(match.score().softSkillsScore());
        record.setKeywordRelevanceScore(match.score().keywordRelevanceScore());
        record.setVerdict(match.score().verdict());
        record.setRubricSummary(match.score().rubricSummary());

        try {
            record.setMatchedSkillsJson(objectMapper.writeValueAsString(match.skills().matchedSkills()));
            record.setMissingSkillsJson(objectMapper.writeValueAsString(match.skills().missingSkills()));
            record.setAdditionalSkillsJson(objectMapper.writeValueAsString(match.skills().additionalSkills()));
            record.setBulletImprovementsJson(objectMapper.writeValueAsString(fullAnalysis.aiAdvice().bulletImprovements()));
            record.setSkillRecommendationsJson(objectMapper.writeValueAsString(fullAnalysis.aiAdvice().skillRecommendations()));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize skills or bullet improvements to JSON", e);
            throw new RuntimeException("Serialization failure during analysis save", e);
        }

        record.setProfessionalSummary(fullAnalysis.aiAdvice().professionalSummarySuggestion());
        record.setAdvisorySource(fullAnalysis.aiAdvice().advisorySource());

        AnalysisRecord saved = repository.save(record);
        log.info("Saved analysis report with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Retrieves a paginated list of analysis summaries for dashboard history view.
     * Filters by current authenticated user if logged in, otherwise returns global records.
     */
    @Transactional(readOnly = true)
    public Page<AnalysisSummaryDto> getHistory(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 100)));
        return authService.getCurrentUser()
                .map(user -> repository.findByUserOrderByCreatedAtDesc(user, pageable))
                .orElseGet(() -> repository.findAllByOrderByCreatedAtDesc(pageable))
                .map(this::toSummaryDto);
    }

    /**
     * Retrieves full analysis record by primary key ID.
     */
    @Transactional(readOnly = true)
    public AnalysisRecord getAnalysisById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new InvalidFileException("Analysis record with ID " + id + " was not found."));
    }

    /**
     * Deletes an analysis record by ID.
     */
    @Transactional
    public void deleteAnalysis(Long id) {
        if (!repository.existsById(id)) {
            throw new InvalidFileException("Analysis record with ID " + id + " does not exist.");
        }
        repository.deleteById(id);
        log.info("Deleted analysis record with ID: {}", id);
    }

    private AnalysisSummaryDto toSummaryDto(AnalysisRecord record) {
        int matchedCount = 0;
        int missingCount = 0;
        try {
            if (record.getMatchedSkillsJson() != null) {
                matchedCount = objectMapper.readTree(record.getMatchedSkillsJson()).size();
            }
            if (record.getMissingSkillsJson() != null) {
                missingCount = objectMapper.readTree(record.getMissingSkillsJson()).size();
            }
        } catch (Exception ignored) {
        }

        return new AnalysisSummaryDto(
                record.getId(),
                record.getCandidateName(),
                record.getTargetJobTitle(),
                record.getOverallScore(),
                record.getTechnicalScore(),
                record.getVerdict(),
                matchedCount,
                missingCount,
                record.getCreatedAt()
        );
    }
}
