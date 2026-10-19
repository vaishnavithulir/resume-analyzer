package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.ApiResponse;
import com.resumeanalyzer.dto.ChatRequest;
import com.resumeanalyzer.dto.ChatResponse;
import com.resumeanalyzer.service.ChatAdvisorService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/resumes/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final ChatAdvisorService chatAdvisorService;

    public ChatController(ChatAdvisorService chatAdvisorService) {
        this.chatAdvisorService = chatAdvisorService;
    }

    /**
     * Context-aware chatbot assistant for interactive resume enhancement and coaching.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@Valid @RequestBody ChatRequest request) {
        log.info("Received resume enhancement chat request: '{}'",
                request.message().length() > 50 ? request.message().substring(0, 47) + "..." : request.message());

        ChatResponse response = chatAdvisorService.chat(request);
        return ResponseEntity.ok(ApiResponse.ok("Response generated successfully", response));
    }
}
