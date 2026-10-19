package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.AnalysisSummaryDto;
import com.resumeanalyzer.entity.AnalysisRecord;
import com.resumeanalyzer.exception.GlobalExceptionHandler;
import com.resumeanalyzer.service.AnalysisHistoryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

@WebMvcTest(controllers = AnalysisHistoryController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class},
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.resumeanalyzer.config.SecurityConfig.class))
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AnalysisHistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalysisHistoryService historyService;

    @Test
    @DisplayName("Should return 200 OK with paginated list of analysis records")
    void testGetHistory() throws Exception {
        AnalysisSummaryDto summary = new AnalysisSummaryDto(
                1L, "Alice Smith", "Java Developer", 85, 55.0, "Strong Match", 5, 1, Instant.now()
        );
        when(historyService.getHistory(anyInt(), anyInt())).thenReturn(new PageImpl<>(List.of(summary)));

        mockMvc.perform(get("/api/v1/resumes/history")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].candidateName").value("Alice Smith"))
                .andExpect(jsonPath("$.data.content[0].overallScore").value(85));
    }

    @Test
    @DisplayName("Should return 200 OK with detailed record by ID")
    void testGetAnalysisById() throws Exception {
        AnalysisRecord record = new AnalysisRecord();
        record.setId(1L);
        record.setCandidateName("Bob");
        record.setTargetJobTitle("Backend Dev");
        record.setOverallScore(70);
        record.setVerdict("Good Match");

        when(historyService.getAnalysisById(1L)).thenReturn(record);

        mockMvc.perform(get("/api/v1/resumes/history/1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.candidateName").value("Bob"));
    }

    @Test
    @DisplayName("Should return 200 OK when deleting an existing record")
    void testDeleteAnalysis() throws Exception {
        doNothing().when(historyService).deleteAnalysis(1L);

        mockMvc.perform(delete("/api/v1/resumes/history/1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
