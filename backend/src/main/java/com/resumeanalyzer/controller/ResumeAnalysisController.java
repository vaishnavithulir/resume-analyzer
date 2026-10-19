package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.*;
import com.resumeanalyzer.exception.InvalidFileException;
import com.resumeanalyzer.service.*;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeAnalysisController {

    private static final Logger log = LoggerFactory.getLogger(ResumeAnalysisController.class);

    private final ScoringEngineService scoringEngineService;
    private final ResumeParserService resumeParserService;
    private final AiAdvisorService aiAdvisorService;
    private final AnalysisHistoryService historyService;

    public ResumeAnalysisController(ScoringEngineService scoringEngineService,
                                    ResumeParserService resumeParserService,
                                    AiAdvisorService aiAdvisorService,
                                    AnalysisHistoryService historyService) {
        this.scoringEngineService = scoringEngineService;
        this.resumeParserService = resumeParserService;
        this.aiAdvisorService = aiAdvisorService;
        this.historyService = historyService;
    }

    /**
     * Analyzes candidate resume text against target job description text.
     */
    @PostMapping(value = "/analyze-match", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<MatchAnalysisResponse>> analyzeMatch(
            @Valid @RequestBody AnalyzeMatchRequest request
    ) {
        log.info("Received request for resume match analysis (resume length: {}, JD length: {})",
                request.resumeText().length(), request.jobDescription().length());

        MatchAnalysisResponse response = scoringEngineService.analyzeMatch(
                request.resumeText(),
                request.jobDescription()
        );

        return ResponseEntity.ok(ApiResponse.ok("Resume match analysis completed", response));
    }

    /**
     * Generates AI-powered resume enhancement recommendations, bullet rewrites, and skill bridging tips.
     */
    @PostMapping(value = "/ai-advice", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<AiAdviceResponse>> generateAiAdvice(
            @Valid @RequestBody AnalyzeMatchRequest request
    ) {
        log.info("Received request for AI advisory feedback");
        MatchAnalysisResponse match = scoringEngineService.analyzeMatch(
                request.resumeText(),
                request.jobDescription()
        );
        AiAdviceResponse advice = aiAdvisorService.generateAdvice(
                request.resumeText(),
                request.jobDescription(),
                match
        );
        return ResponseEntity.ok(ApiResponse.ok("AI resume advice generated successfully", advice));
    }

    /**
     * Unified comprehensive endpoint returning both match scores and AI recommendations in one call.
     * Optionally persists the session to the database if save=true.
     */
    @PostMapping(value = "/analyze-full", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<FullAnalysisResponse>> analyzeFull(
            @Valid @RequestBody AnalyzeMatchRequest request,
            @RequestParam(name = "save", defaultValue = "false") boolean save,
            @RequestParam(name = "candidateName", required = false) String candidateName,
            @RequestParam(name = "jobTitle", required = false) String jobTitle
    ) {
        log.info("Received request for full match + AI analysis (save={})", save);
        MatchAnalysisResponse match = scoringEngineService.analyzeMatch(
                request.resumeText(),
                request.jobDescription()
        );
        AiAdviceResponse advice = aiAdvisorService.generateAdvice(
                request.resumeText(),
                request.jobDescription(),
                match
        );
        FullAnalysisResponse fullResponse = new FullAnalysisResponse(match, advice);

        if (save) {
            historyService.saveAnalysis(candidateName, jobTitle, fullResponse);
        }

        return ResponseEntity.ok(ApiResponse.ok("Full analysis completed successfully", fullResponse));
    }

    /**
     * Uploads a resume file (PDF/DOCX) and analyzes it directly against target job description text in one step.
     *
     * @param file the resume document
     * @param jobDescription the target job requirements
     * @return structured match analysis
     */
    @PostMapping(value = "/analyze-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<MatchAnalysisResponse>> analyzeFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobDescription") String jobDescription
    ) {
        if (jobDescription == null || jobDescription.trim().length() < 20) {
            throw new InvalidFileException("Job description must be provided and contain at least 20 characters.");
        }

        log.info("Received file and job description for direct match analysis. File: '{}'",
                file.getOriginalFilename());

        ResumeTextExtractionResponse extraction = resumeParserService.parseResume(file);
        MatchAnalysisResponse response = scoringEngineService.analyzeMatch(
                extraction.extractedText(),
                jobDescription
        );

        return ResponseEntity.ok(ApiResponse.ok("Resume file match analysis completed", response));
    }
}
