package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.AiAdviceResponse;
import com.resumeanalyzer.dto.BulletImprovement;
import com.resumeanalyzer.dto.MatchAnalysisResponse;
import com.resumeanalyzer.dto.SkillRecommendation;
import com.resumeanalyzer.model.SkillItem;
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
public class AiAdvisorService {

    private static final Logger log = LoggerFactory.getLogger(AiAdvisorService.class);

    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:gemini-1.5-flash}")
    private String model;

    @Value("${app.ai.endpoint:https://generativelanguage.googleapis.com/v1beta/models}")
    private String endpoint;

    @Value("${app.ai.timeout-seconds:15}")
    private int timeoutSeconds;

    public AiAdvisorService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofSeconds(20));
        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    /**
     * Generates structured AI resume advisory feedback using Gemini LLM with automated rule-based fallback.
     */
    public AiAdviceResponse generateAdvice(String resumeText, String jobDescription, MatchAnalysisResponse matchAnalysis) {
        if (apiKey == null || apiKey.isBlank() || apiKey.trim().equalsIgnoreCase("dummy")) {
            log.info("No LLM API key configured. Generating high-fidelity rule-based advisory feedback.");
            return generateFallbackAdvice(resumeText, jobDescription, matchAnalysis);
        }

        try {
            return callGeminiApi(resumeText, jobDescription, matchAnalysis);
        } catch (Exception e) {
            log.warn("Gemini LLM API call encountered an issue ({}). Gracefully falling back to rule-based advisor.",
                    e.getMessage());
            return generateFallbackAdvice(resumeText, jobDescription, matchAnalysis);
        }
    }

    private AiAdviceResponse callGeminiApi(String resumeText, String jobDescription, MatchAnalysisResponse matchAnalysis) {
        String prompt = buildPrompt(resumeText, jobDescription, matchAnalysis);
        String targetUrl = String.format("%s/%s:generateContent?key=%s", endpoint, model, apiKey.trim());

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "responseMimeType", "application/json"
                )
        );

        String rawResponse = restClient.post()
                .uri(targetUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        return parseGeminiResponse(rawResponse, resumeText, jobDescription, matchAnalysis);
    }

    public AiAdviceResponse parseGeminiResponse(String responseJson, String resumeText, String jobDescription, MatchAnalysisResponse matchAnalysis) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode textNode = firstCandidate.path("content").path("parts").get(0).path("text");
                if (!textNode.isMissingNode()) {
                    String jsonContent = textNode.asText().trim();
                    // Strip potential markdown code block wrappers if present
                    if (jsonContent.startsWith("```json")) {
                        jsonContent = jsonContent.substring(7);
                    }
                    if (jsonContent.startsWith("```")) {
                        jsonContent = jsonContent.substring(3);
                    }
                    if (jsonContent.endsWith("```")) {
                        jsonContent = jsonContent.substring(0, jsonContent.length() - 3);
                    }
                    jsonContent = jsonContent.trim();

                    JsonNode parsed = objectMapper.readTree(jsonContent);

                    String summary = parsed.path("professionalSummarySuggestion").asText(
                            "Software developer with strong computer science fundamentals and hands-on project experience."
                    );

                    List<BulletImprovement> bullets = new ArrayList<>();
                    JsonNode bulletsNode = parsed.path("bulletImprovements");
                    if (bulletsNode.isArray()) {
                        for (JsonNode b : bulletsNode) {
                            bullets.add(new BulletImprovement(
                                    b.path("originalBullet").asText(),
                                    b.path("improvedBullet").asText(),
                                    b.path("rationale").asText()
                            ));
                        }
                    }

                    List<SkillRecommendation> skillRecs = new ArrayList<>();
                    JsonNode skillsNode = parsed.path("skillRecommendations");
                    if (skillsNode.isArray()) {
                        for (JsonNode s : skillsNode) {
                            skillRecs.add(new SkillRecommendation(
                                    s.path("skillName").asText(),
                                    s.path("category").asText(),
                                    s.path("actionableAdvice").asText()
                            ));
                        }
                    }

                    List<String> strengths = extractStringList(parsed.path("keyStrengths"));
                    List<String> improvements = extractStringList(parsed.path("criticalImprovements"));

                    return new AiAdviceResponse(
                            summary,
                            bullets,
                            skillRecs,
                            strengths,
                            improvements,
                            "GEMINI_LLM"
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse Gemini API JSON response: {}. Using fallback advice.", e.getMessage());
        }

        return generateFallbackAdvice(resumeText, jobDescription, matchAnalysis);
    }

    private List<String> extractStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) {
            for (JsonNode item : node) {
                list.add(item.asText());
            }
        }
        return list;
    }

    private String buildPrompt(String resumeText, String jobDescription, MatchAnalysisResponse matchAnalysis) {
        String matchedList = matchAnalysis.skills().matchedSkills().stream()
                .map(SkillItem::name).collect(Collectors.joining(", "));
        String missingList = matchAnalysis.skills().missingSkills().stream()
                .map(SkillItem::name).collect(Collectors.joining(", "));

        return """
                You are a Senior Technical Recruiter and Hiring Manager reviewing a software engineer candidate's resume against a job description.
                
                CRITICAL RULES:
                1. NEVER invent fake companies, degrees, or imaginary projects.
                2. Do NOT promise guaranteed ATS scores.
                3. Rewrite bullet points using high-impact accomplishment framework: Achieved [Result], as measured by [Metric], by engineering [Technical Solution].
                4. Provide specific bridging advice for missing skills (how the candidate can demonstrate them via personal projects or coursework).
                
                RESUME TEXT:
                \"\"\"%s\"\"\"
                
                TARGET JOB DESCRIPTION:
                \"\"\"%s\"\"\"
                
                PRE-ANALYZED DATA:
                - Matched Skills: %s
                - Missing Skills: %s
                
                Return ONLY a JSON object with this exact schema:
                {
                  "professionalSummarySuggestion": "A concise 2-sentence tailored professional summary",
                  "bulletImprovements": [
                    {
                      "originalBullet": "Representative bullet point from the resume",
                      "improvedBullet": "Sharper, metric-oriented rewrite with quantified impact",
                      "rationale": "Brief recruiter explanation of the enhancement"
                    }
                  ],
                  "skillRecommendations": [
                    {
                      "skillName": "Missing skill",
                      "category": "Domain category",
                      "actionableAdvice": "Concrete project idea to bridge this gap"
                    }
                  ],
                  "keyStrengths": ["Strength 1", "Strength 2"],
                  "criticalImprovements": ["Improvement 1", "Improvement 2"]
                }
                """.formatted(
                truncate(resumeText, 2500),
                truncate(jobDescription, 2000),
                matchedList.isBlank() ? "None detected" : matchedList,
                missingList.isBlank() ? "None missing" : missingList
        );
    }

    /**
     * Deterministic, rule-based advisory fallback for reliable offline / keyless operation.
     */
    public AiAdviceResponse generateFallbackAdvice(String resumeText, String jobDescription, MatchAnalysisResponse matchAnalysis) {
        List<SkillItem> matched = matchAnalysis.skills().matchedSkills();
        List<SkillItem> missing = matchAnalysis.skills().missingSkills();

        String topSkills = matched.stream().limit(4).map(SkillItem::name).collect(Collectors.joining(", "));
        if (topSkills.isBlank()) {
            topSkills = "Java, Spring Boot, and RESTful APIs";
        }

        String summary = String.format(
                "Results-driven Software Engineer with proven hands-on proficiency in %s. Experienced in architecting scalable backend services, optimizing relational databases, and delivering clean, test-driven applications aligned with modern engineering standards.",
                topSkills
        );

        List<BulletImprovement> bullets = extractAndImproveBullets(resumeText);

        List<SkillRecommendation> skillRecs = new ArrayList<>();
        for (SkillItem item : missing.stream().limit(4).toList()) {
            skillRecs.add(new SkillRecommendation(
                    item.name(),
                    item.category().getDisplayName(),
                    generateProjectBridgingTip(item.name())
            ));
        }

        List<String> strengths = List.of(
                "Strong alignment on core technologies: " + topSkills,
                "Clear demonstration of software engineering methodologies and problem-solving",
                "Clean structural presentation of technical competencies"
        );

        List<String> improvements = new ArrayList<>();
        if (!missing.isEmpty()) {
            String missingNames = missing.stream().limit(3).map(SkillItem::name).collect(Collectors.joining(", "));
            improvements.add("Explicitly address high-priority job requirements: " + missingNames);
        }
        improvements.add("Quantify project bullet points with measurable impact (e.g., latency reduction, test coverage, throughput)");
        improvements.add("Add a concise 2-line targeted summary statement at the top of your resume");

        return new AiAdviceResponse(
                summary,
                bullets,
                skillRecs,
                strengths,
                improvements,
                "RULE_BASED_FALLBACK"
        );
    }

    private List<BulletImprovement> extractAndImproveBullets(String resumeText) {
        List<BulletImprovement> list = new ArrayList<>();
        list.add(new BulletImprovement(
                "Built a web application using Spring Boot and MySQL for user management.",
                "Engineered a high-performance RESTful user management microservice using Spring Boot and MySQL, implementing JWT authentication and reducing query latency by 25%.",
                "Replaces passive phrasing with strong technical verbs, mentions architectural design (REST microservice), and introduces measurable performance metrics."
        ));

        list.add(new BulletImprovement(
                "Worked on frontend components with React and connected to APIs.",
                "Designed responsive, reusable React components and integrated REST endpoints with Axios, cutting client-side render times and enhancing UI state consistency.",
                "Emphasizes architectural reuse, UI performance optimization, and concrete state management practices."
        ));

        return list;
    }

    private String generateProjectBridgingTip(String skillName) {
        return switch (skillName.toLowerCase(Locale.ROOT)) {
            case "docker" -> "Containerize an existing project with a multi-stage Dockerfile and add docker-compose for local database orchestration.";
            case "kubernetes", "k8s" -> "Deploy your microservices to a local Minikube or Kind cluster using custom Deployment and Service manifests.";
            case "aws" -> "Deploy your Spring Boot service to AWS ECS or Elastic Beanstalk, utilizing Amazon RDS for MySQL and S3 for media storage.";
            case "redis" -> "Implement a Redis caching layer for frequent read endpoints to demonstrate caching strategies and cache-invalidation patterns.";
            case "kafka" -> "Add asynchronous event messaging between your services using Apache Kafka to showcase event-driven architecture.";
            case "ci/cd" -> "Configure a GitHub Actions pipeline that automatically triggers unit tests and builds a container image on every pull request.";
            default -> "Build a focused portfolio feature or micro-project demonstrating hands-on integration of " + skillName + " with unit test coverage.";
        };
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return "";
        return text.length() <= maxLength ? text : text.substring(0, maxLength);
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
}
