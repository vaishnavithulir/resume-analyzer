package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.ApiResponse;
import com.resumeanalyzer.dto.ResumeTextExtractionResponse;
import com.resumeanalyzer.service.ResumeParserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeExtractionController {

    private static final Logger log = LoggerFactory.getLogger(ResumeExtractionController.class);

    private final ResumeParserService resumeParserService;

    public ResumeExtractionController(ResumeParserService resumeParserService) {
        this.resumeParserService = resumeParserService;
    }

    /**
     * Uploads and extracts text from a PDF or DOCX resume document.
     *
     * @param file the uploaded resume file
     * @return extracted text, word count, character count, and preview snippet
     */
    @PostMapping(value = "/extract-text", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ResumeTextExtractionResponse>> extractResumeText(
            @RequestParam("file") MultipartFile file
    ) {
        log.info("Received request to extract text from file: '{}' ({} bytes)",
                file.getOriginalFilename(), file.getSize());

        ResumeTextExtractionResponse response = resumeParserService.parseResume(file);

        return ResponseEntity.ok(ApiResponse.ok("Resume text extracted successfully", response));
    }
}
