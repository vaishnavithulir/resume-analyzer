package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.ChatMessageDto;
import com.resumeanalyzer.dto.ChatRequest;
import com.resumeanalyzer.dto.ChatResponse;
import com.resumeanalyzer.dto.ResumeContextDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatAdvisorService {

    private static final Logger log = LoggerFactory.getLogger(ChatAdvisorService.class);

    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:gemini-1.5-flash}")
    private String model;

    @Value("${app.ai.endpoint:https://generativelanguage.googleapis.com/v1beta/models}")
    private String endpoint;

    public ChatAdvisorService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(25));
        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    /**
     * Answers candidate queries focused on enhancing their resume and standing out in SWE hiring.
     */
    public ChatResponse chat(ChatRequest request) {
        if (apiKey == null || apiKey.isBlank() || apiKey.trim().equalsIgnoreCase("dummy")) {
            log.info("No LLM API key configured for chatbot. Utilizing contextual Resume Enhancement Engine.");
            return generateContextualEnhancementReply(request);
        }

        try {
            return callGeminiChat(request);
        } catch (Exception e) {
            log.warn("Gemini Chat API error: {}. Falling back to Resume Enhancement Engine.", e.getMessage());
            return generateContextualEnhancementReply(request);
        }
    }

    private ChatResponse callGeminiChat(ChatRequest request) {
        String targetUrl = String.format("%s/%s:generateContent?key=%s", endpoint, model, apiKey.trim());
        String systemInstruction = buildSystemPrompt(request.context());

        List<Map<String, Object>> contents = new ArrayList<>();

        // Add previous dialogue history if provided
        if (request.conversationHistory() != null) {
            for (ChatMessageDto hist : request.conversationHistory()) {
                String role = hist.role().equalsIgnoreCase("assistant") ? "model" : "user";
                contents.add(Map.of(
                        "role", role,
                        "parts", List.of(Map.of("text", hist.content()))
                ));
            }
        }

        // Add current user prompt
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", request.message()))
        ));

        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", systemInstruction))
                ),
                "contents", contents,
                "generationConfig", Map.of(
                        "temperature", 0.4,
                        "maxOutputTokens", 1200
                )
        );

        String responseJson = restClient.post()
                .uri(targetUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        String replyText = parseGeminiText(responseJson);
        return ChatResponse.of(replyText, "GEMINI_LLM");
    }

    private String parseGeminiText(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText().trim();
                }
            }
            throw new RuntimeException("Empty or malformed candidate response from Gemini API.");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini Chat response: " + e.getMessage(), e);
        }
    }

    private String buildSystemPrompt(ResumeContextDto ctx) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an Elite Technical Resume Enhancer and Senior SWE Hiring Manager.\n");
        sb.append("Follow the High-Impact Accomplishment Framework: 'Achieved [Measurable Result] as measured by [Metric] by engineering [Technical Solution]'.\n");
        sb.append("Provide actionable bullet rewrites, specific metric recommendations, and clear guidance on incorporating missing skills.\n\n");

        if (ctx != null) {
            sb.append("=== CANDIDATE CONTEXT ===\n");
            if (ctx.candidateName() != null && !ctx.candidateName().isBlank()) {
                sb.append("Candidate Name: ").append(ctx.candidateName()).append("\n");
            }
            if (ctx.targetJobTitle() != null && !ctx.targetJobTitle().isBlank()) {
                sb.append("Target Job Title: ").append(ctx.targetJobTitle()).append("\n");
            }
            if (ctx.overallScore() != null && ctx.overallScore() > 0) {
                sb.append("Current ATS Match Score: ").append(ctx.overallScore()).append("/100\n");
            }
            if (ctx.matchedSkills() != null && !ctx.matchedSkills().isEmpty()) {
                sb.append("Matched Skills: ").append(String.join(", ", ctx.matchedSkills())).append("\n");
            }
            if (ctx.missingSkills() != null && !ctx.missingSkills().isEmpty()) {
                sb.append("Missing Skills Required by Job: ").append(String.join(", ", ctx.missingSkills())).append("\n");
            }
            if (ctx.resumeSnippet() != null && !ctx.resumeSnippet().isBlank()) {
                sb.append("Resume Excerpt: ").append(ctx.resumeSnippet()).append("\n");
            }
            if (ctx.jobDescriptionSnippet() != null && !ctx.jobDescriptionSnippet().isBlank()) {
                sb.append("Job Description Excerpt: ").append(ctx.jobDescriptionSnippet()).append("\n");
            }
            sb.append("=========================\n\n");
        }

        sb.append("Formatting instructions: Use clean Markdown (bullet points, bold text for key terms, clear sections). Keep answers focused, practical, and directly applicable to software developer resumes.");
        return sb.toString();
    }

    /**
     * Contextual rule-based resume enhancement engine.
     * Evaluates candidate query keywords against their active resume context.
     */
    public ChatResponse generateContextualEnhancementReply(ChatRequest request) {
        String msg = request.message().toLowerCase(Locale.ROOT);
        ResumeContextDto ctx = request.context() != null ? request.context() : ResumeContextDto.empty();

        List<String> matched = ctx.matchedSkills() != null ? ctx.matchedSkills() : List.of("Java", "Spring Boot", "REST APIs");
        List<String> missing = ctx.missingSkills() != null ? ctx.missingSkills() : List.of("Docker", "SQL");
        String candidate = (ctx.candidateName() != null && !ctx.candidateName().isBlank()) ? ctx.candidateName() : "Candidate";
        String job = (ctx.targetJobTitle() != null && !ctx.targetJobTitle().isBlank()) ? ctx.targetJobTitle() : "Software Engineer";
        int score = ctx.overallScore() != null ? ctx.overallScore() : 50;

        StringBuilder reply = new StringBuilder();

        // Check if query refers to any specific missing skill directly (e.g., "how to add docker?")
        boolean mentionsMissingSkill = missing.stream().anyMatch(s -> msg.contains(s.toLowerCase(Locale.ROOT)));

        // 1. BULLET REWRITES / XYZ FORMULA (Option 1, "1", "rewrite", "bullet", etc.)
        if (msg.equals("1") || msg.startsWith("1.") || msg.contains("option 1") || msg.contains("first")
                || msg.contains("bullet") || msg.contains("rewrite") || msg.contains("point") || msg.contains("experience") || msg.contains("project")
                || msg.contains("worked on") || msg.contains("developed") || msg.contains("responsible for")) {
            String topMatched = matched.isEmpty() ? "Java & Spring Boot" : String.join(", ", matched.subList(0, Math.min(3, matched.size())));
            String primaryMissing = missing.isEmpty() ? "Docker" : missing.get(0);

            reply.append("### ✍️ High-Impact Resume Bullet Rewrites\n\n");
            reply.append("To pass ATS filters and impress engineering recruiters, transform passive tasks into **quantified achievements**:\n");
            reply.append("> *\"Achieved **[Result]**, as measured by **[Metric]**, by engineering **[Technical Solution]**.\"*\n\n");

            reply.append("#### Example 1: Core Technologies (**").append(topMatched).append("**)\n");
            reply.append("* **Before (Weak):** *\"Worked on developing web features and connected backend APIs.\"*\n");
            reply.append("* **Optimized (High-Impact):** *\"Architected and deployed responsive UI components integrated with REST microservices using **").append(topMatched)
                    .append("**, cutting client-side latency by **28%** and enhancing data synchronization.\"*\n\n");

            reply.append("#### Example 2: Bridging Your Gap Skill (**").append(primaryMissing).append("**)\n");
            reply.append("* **Before (Weak):** *\"Learned ").append(primaryMissing).append(" and containerized code.\"*\n");
            reply.append("* **Optimized (High-Impact):** *\"Containerized full-stack services using **").append(primaryMissing)
                    .append("** with automated multi-stage builds, slashing staging environment setup time from 35 min to **3 min**.\"*\n\n");

            reply.append("💡 **Action Verbs to Use:** *Architected, Engineered, Optimized, Spearheaded, Refactored, Containerized*.\n\n");
            reply.append("*Paste any experience bullet point from your resume here, and I will rewrite it for you!*");
            return ChatResponse.of(reply.toString(), "RESUME_ENHANCER_ENGINE");
        }

        // 2. MISSING SKILLS / KEYWORD GAPS (Option 2, "2", skill names, etc.)
        if (msg.equals("2") || msg.startsWith("2.") || msg.contains("option 2") || msg.contains("second")
                || msg.contains("missing") || msg.contains("skill") || msg.contains("keyword") || msg.contains("gap") || msg.contains("add")
                || mentionsMissingSkill) {
            reply.append("### 🎯 How to Naturally Incorporate Missing Skills\n\n");
            if (missing.isEmpty()) {
                reply.append("Great news! Your resume already matches the key technical requirements extracted from this job description. To stand out further, focus on highlighting architectural design patterns, unit test coverage, and automated deployment pipelines.\n");
            } else {
                reply.append("Your current ATS match score is **").append(score).append("/100**. The primary missing competencies identified are:\n\n");
                for (String m : missing) {
                    reply.append("* **").append(m).append("**: Required by the job description.\n");
                }
                reply.append("\n#### 3-Step Strategy to Bridge Gaps Without False Claims:\n");
                reply.append("1. **Build a 1-Day Proof-of-Concept**: Create a mini GitHub repository highlighting `").append(missing.get(0)).append("` (e.g. Dockerize your project or configure CI/CD).\n");
                reply.append("2. **Contextual Placement**: Add it in your Technical Skills section: `Tools & Infrastructure: ").append(String.join(", ", missing)).append("`.\n");
                reply.append("3. **Highlight Familiarity in Summary**: Phrase as: *\"Hands-on proficiency in ").append(String.join(", ", matched.subList(0, Math.min(2, matched.size()))))
                        .append(" with working familiarity in ").append(missing.get(0)).append(".\"*\n");
            }
            return ChatResponse.of(reply.toString(), "RESUME_ENHANCER_ENGINE");
        }

        // 3. PROFESSIONAL SUMMARY (Option 3, "3", "summary", etc.)
        if (msg.equals("3") || msg.startsWith("3.") || msg.contains("option 3") || msg.contains("third")
                || msg.contains("summary") || msg.contains("intro") || msg.contains("profile") || msg.contains("about")) {
            reply.append("### 🌟 Optimized Professional Summary\n\n");
            reply.append("Place this punchy 2-line summary at the top of your resume to immediately pass the 6-second recruiter screen:\n\n");
            reply.append("> *\"Results-driven **").append(job).append("** with practical proficiency in **")
                    .append(String.join(", ", matched.subList(0, Math.min(3, matched.size()))))
                    .append("**. Experienced in developing scalable web applications, optimizing component performance, and implementing robust SDLC standards.\"*\n\n");
            reply.append("📌 **Pro-Tip:** Avoid generic buzzwords like *\"quick learner\"* or *\"hard worker\"*. Recruiters prioritize concrete technologies and proven outputs.");
            return ChatResponse.of(reply.toString(), "RESUME_ENHANCER_ENGINE");
        }

        // 4. TECHNICAL INTERVIEW PREPARATION (Option 4, "4", "interview", etc.)
        if (msg.equals("4") || msg.startsWith("4.") || msg.contains("option 4") || msg.contains("fourth")
                || msg.contains("interview") || msg.contains("question") || msg.contains("prep") || msg.contains("prepare")) {
            reply.append("### 🎯 Likely Technical Interview Questions for this Role\n\n");
            reply.append("Based on the cross-reference between your resume and the **").append(job).append("** description:\n\n");
            if (!matched.isEmpty()) {
                reply.append("1. **Deep Dive on ").append(matched.get(0)).append("**:\n");
                reply.append("   * *\"Can you explain how you handle state management, lifecycle events, and performance optimization in your ").append(matched.get(0)).append(" projects?\"*\n\n");
            }
            if (!missing.isEmpty()) {
                reply.append("2. **Handling Identified Gap (**").append(missing.get(0)).append("**)**:\n");
                reply.append("   * *\"The role lists ").append(missing.get(0)).append(". Have you worked with containerization/deployment in any coursework or side projects?\"*\n\n");
            }
            reply.append("3. **Architecture & Clean Code**:\n");
            reply.append("   * *\"How do you organize your project structure, ensure automated test coverage, and handle asynchronous API requests?\"*\n\n");
            reply.append("💡 *Structure your answers using the **STAR method** (Situation, Task, Action, Result).*");
            return ChatResponse.of(reply.toString(), "RESUME_ENHANCER_ENGINE");
        }

        // 5. SCORE IMPROVEMENT / ATS BOOST
        if (msg.contains("score") || msg.contains("improve") || msg.contains("increase") || msg.contains("boost") || msg.contains("ats")) {
            reply.append("### 📈 Roadmap to Reach an 80+ Match Score\n\n");
            reply.append("Your current score is **").append(score).append("/100**. Here is how the scoring engine calculates it:\n\n");
            reply.append("* **Technical Stack (60% weight)**: Matches required frameworks, languages, and tools.\n");
            reply.append("* **Soft & Collaboration Skills (20% weight)**: Teamwork, Agile/Scrum, Problem Solving.\n");
            reply.append("* **Keyword Relevance (20% weight)**: Density and semantic alignment with JD responsibilities.\n\n");
            reply.append("#### Top 3 Immediate Actions to Boost Your Score:\n");
            if (!missing.isEmpty()) {
                reply.append("1. **Add Missing Keywords**: Address `").append(String.join("`, `", missing)).append("` in your Skills matrix.\n");
            } else {
                reply.append("1. **Expand Core Competencies**: Add explicit mention of your database and deployment tools.\n");
            }
            reply.append("2. **Quantify Results**: Add numbers, percentages, or user counts to at least 3 project bullets.\n");
            reply.append("3. **Align Job Title**: Ensure your resume header mirrors the target title: **").append(job).append("**.");
            return ChatResponse.of(reply.toString(), "RESUME_ENHANCER_ENGINE");
        }

        // 6. GENERAL QUESTIONS ("what i do", "what should i do", "help", "guide")
        reply.append("### 🚀 Personalized Recommendations for ").append(candidate).append("\n\n");
        reply.append("Based on your target role (**").append(job).append("**), your resume scored **").append(score).append("/100**.\n\n");
        if (!missing.isEmpty()) {
            reply.append("👉 **Fastest way to increase your score:** Address missing skill **").append(missing.get(0)).append("**.\n\n");
        }
        reply.append("Here is how we can enhance your resume together:\n\n");
        reply.append("* **Type 1** ➔ **Transform Experience Bullets** into quantified achievements.\n");
        reply.append("* **Type 2** ➔ **Bridge Missing Skills** (`").append(missing.isEmpty() ? "Docker" : String.join(", ", missing)).append("`) without keyword stuffing.\n");
        reply.append("* **Type 3** ➔ Generate an **Optimized 2-Line Summary** tailored for this position.\n");
        reply.append("* **Type 4** ➔ Review **Technical Interview Questions** expected for this role.\n\n");
        reply.append("*You can type **1**, **2**, **3**, or **4**, or paste any project bullet point here!*");

        return ChatResponse.of(reply.toString(), "RESUME_ENHANCER_ENGINE");
    }
}
