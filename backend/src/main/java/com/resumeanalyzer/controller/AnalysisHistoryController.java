package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.AnalysisSummaryDto;
import com.resumeanalyzer.dto.ApiResponse;
import com.resumeanalyzer.entity.AnalysisRecord;
import com.resumeanalyzer.service.AnalysisHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/resumes/history")
public class AnalysisHistoryController {

    private final AnalysisHistoryService historyService;

    public AnalysisHistoryController(AnalysisHistoryService historyService) {
        this.historyService = historyService;
    }

    /**
     * Retrieves paginated analysis history.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AnalysisSummaryDto>>> getHistory(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        Page<AnalysisSummaryDto> history = historyService.getHistory(page, size);
        return ResponseEntity.ok(ApiResponse.ok("History retrieved successfully", history));
    }

    /**
     * Retrieves full analysis report by record ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AnalysisRecord>> getAnalysisById(@PathVariable("id") Long id) {
        AnalysisRecord record = historyService.getAnalysisById(id);
        return ResponseEntity.ok(ApiResponse.ok("Analysis record retrieved successfully", record));
    }

    /**
     * Deletes an analysis record by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAnalysis(@PathVariable("id") Long id) {
        historyService.deleteAnalysis(id);
        return ResponseEntity.ok(ApiResponse.ok("Analysis record deleted successfully", null));
    }
}
