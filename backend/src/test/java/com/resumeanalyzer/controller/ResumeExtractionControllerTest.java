package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.ResumeTextExtractionResponse;
import com.resumeanalyzer.exception.GlobalExceptionHandler;
import com.resumeanalyzer.exception.UnsupportedFileTypeException;
import com.resumeanalyzer.service.ResumeParserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
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

@WebMvcTest(controllers = ResumeExtractionController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class},
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.resumeanalyzer.config.SecurityConfig.class))
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class ResumeExtractionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResumeParserService resumeParserService;

    @Test
    @DisplayName("Should return 200 OK with extracted data when valid resume is uploaded")
    void testSuccessfulResumeExtraction() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf", "dummy pdf content".getBytes());

        ResumeTextExtractionResponse mockResponse = new ResumeTextExtractionResponse(
                "resume.pdf",
                "application/pdf",
                1024L,
                150,
                800,
                "Extracted resume content with Java and Spring skills",
                "Extracted resume content..."
        );

        when(resumeParserService.parseResume(any())).thenReturn(mockResponse);

        mockMvc.perform(multipart("/api/v1/resumes/extract-text").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.originalFilename").value("resume.pdf"))
                .andExpect(jsonPath("$.data.wordCount").value(150))
                .andExpect(jsonPath("$.data.extractedText").isNotEmpty());
    }

    @Test
    @DisplayName("Should return 415 Unsupported Media Type when file format is not allowed")
    void testUnsupportedFileTypeReturns415() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "script.exe", "application/octet-stream", "binary content".getBytes());

        when(resumeParserService.parseResume(any()))
                .thenThrow(new UnsupportedFileTypeException("File extension '.exe' is not supported."));

        mockMvc.perform(multipart("/api/v1/resumes/extract-text").file(file))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.status").value(415))
                .andExpect(jsonPath("$.error").value("Unsupported Media Type"))
                .andExpect(jsonPath("$.message").value("File extension '.exe' is not supported."));
    }
}
