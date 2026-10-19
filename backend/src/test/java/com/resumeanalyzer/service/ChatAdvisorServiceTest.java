package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.ChatMessageDto;
import com.resumeanalyzer.dto.ChatRequest;
import com.resumeanalyzer.dto.ChatResponse;
import com.resumeanalyzer.dto.ResumeContextDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ChatAdvisorServiceTest {

    private ChatAdvisorService chatAdvisorService;

    @BeforeEach
    void setUp() {
        chatAdvisorService = new ChatAdvisorService(new ObjectMapper());
    }

    @Test
    @DisplayName("Should generate quantified bullet rewrites when query asks for bullet point improvements")
    void testBulletRewritesIntent() {
        ResumeContextDto context = new ResumeContextDto(
                "Priya Sharma",
                "Software Engineer",
                65,
                List.of("Java", "Spring Boot", "REST APIs"),
                List.of("Docker", "SQL"),
                "Experienced with Java and Spring Boot.",
                "Seeking Java developer with Docker and SQL."
        );

        ChatRequest request = new ChatRequest("Can you help rewrite my project bullet points?", List.of(), context);
        ChatResponse response = chatAdvisorService.generateContextualEnhancementReply(request);

        assertThat(response.reply()).contains("High-Impact Resume Bullet Rewrites");
        assertThat(response.reply()).contains("Architected and deployed");
        assertThat(response.reply()).contains("Docker");
        assertThat(response.advisorySource()).isEqualTo("RESUME_ENHANCER_ENGINE");
    }

    @Test
    @DisplayName("Should provide actionable gap bridging advice when query asks about missing skills")
    void testMissingSkillsIntent() {
        ResumeContextDto context = new ResumeContextDto(
                "Priya Sharma",
                "Full Stack Developer",
                55,
                List.of("Java", "React"),
                List.of("Kubernetes", "PostgreSQL"),
                "Java React resume",
                "Kubernetes PostgreSQL JD"
        );

        ChatRequest request = new ChatRequest("How do I add my missing skills to my resume?", List.of(), context);
        ChatResponse response = chatAdvisorService.generateContextualEnhancementReply(request);

        assertThat(response.reply()).contains("Kubernetes");
        assertThat(response.reply()).contains("PostgreSQL");
        assertThat(response.reply()).contains("Strategy to Bridge Gaps");
    }

    @Test
    @DisplayName("Should generate targeted professional summary when query asks for profile intro")
    void testSummaryIntent() {
        ResumeContextDto context = new ResumeContextDto(
                "John Doe",
                "Backend Engineer",
                70,
                List.of("Java", "Spring Boot", "Docker"),
                List.of("AWS"),
                "Java Spring Boot resume",
                "Backend Engineer JD"
        );

        ChatRequest request = new ChatRequest("Draft an optimized summary for my resume", List.of(), context);
        ChatResponse response = chatAdvisorService.generateContextualEnhancementReply(request);

        assertThat(response.reply()).contains("Professional Summary");
        assertThat(response.reply()).contains("Backend Engineer");
        assertThat(response.reply()).contains("Java, Spring Boot");
    }

    @Test
    @DisplayName("Should provide technical interview preparation questions based on candidate skills")
    void testInterviewQuestionsIntent() {
        ResumeContextDto context = new ResumeContextDto(
                "Alex Candidate",
                "Java Developer",
                60,
                List.of("Java", "Spring Boot"),
                List.of("Docker"),
                "Java dev resume",
                "Java dev with Docker JD"
        );

        ChatRequest request = new ChatRequest("What technical interview questions might they ask me?", List.of(), context);
        ChatResponse response = chatAdvisorService.generateContextualEnhancementReply(request);

        assertThat(response.reply()).contains("Technical Interview Questions");
        assertThat(response.reply()).contains("Java");
        assertThat(response.reply()).contains("Docker");
        assertThat(response.reply()).contains("STAR method");
    }
}
