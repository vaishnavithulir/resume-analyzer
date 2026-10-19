package com.resumeanalyzer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.ChatMessageDto;
import com.resumeanalyzer.dto.ChatRequest;
import com.resumeanalyzer.dto.ChatResponse;
import com.resumeanalyzer.dto.ResumeContextDto;
import com.resumeanalyzer.exception.GlobalExceptionHandler;
import com.resumeanalyzer.service.ChatAdvisorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ChatController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class},
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.resumeanalyzer.config.SecurityConfig.class))
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatAdvisorService chatAdvisorService;

    @Test
    @DisplayName("Should return 200 OK with advice reply when valid chat request is submitted")
    void testChatEndpointSuccess() throws Exception {
        ChatRequest request = new ChatRequest(
                "How do I improve my resume bullets?",
                List.of(),
                ResumeContextDto.empty()
        );

        ChatResponse mockResponse = new ChatResponse(
                "Use the XYZ formula: Accomplished X by doing Z.",
                "RESUME_ENHANCER_ENGINE",
                Instant.now()
        );

        when(chatAdvisorService.chat(any(ChatRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/resumes/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reply").value("Use the XYZ formula: Accomplished X by doing Z."))
                .andExpect(jsonPath("$.data.advisorySource").value("RESUME_ENHANCER_ENGINE"));
    }

    @Test
    @DisplayName("Should return 400 Bad Request when chat request message is blank")
    void testChatEndpointValidationFailure() throws Exception {
        ChatRequest invalidRequest = new ChatRequest(
                "",
                List.of(),
                ResumeContextDto.empty()
        );

        mockMvc.perform(post("/api/v1/resumes/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }
}
