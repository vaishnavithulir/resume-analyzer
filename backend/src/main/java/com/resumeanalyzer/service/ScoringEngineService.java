package com.resumeanalyzer.service;

import com.resumeanalyzer.dto.MatchAnalysisResponse;
import com.resumeanalyzer.dto.ScoreBreakdown;
import com.resumeanalyzer.dto.SkillMatchBreakdown;
import com.resumeanalyzer.model.SkillCategory;
import com.resumeanalyzer.model.SkillItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ScoringEngineService {

    private static final Logger log = LoggerFactory.getLogger(ScoringEngineService.class);

    private static final Pattern WORD_PATTERN = Pattern.compile("[a-zA-Z0-9#+.-]{2,}");
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
            "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can",
            "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
            "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
            "haven't", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i",
            "if", "in", "into", "is", "isn't", "it", "its", "itself", "let's", "me", "more", "most", "mustn't",
            "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
            "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "should", "shouldn't", "so", "some",
            "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these",
            "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
            "were", "weren't", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "won't",
            "would", "wouldn't", "you", "your", "yours", "yourself", "yourselves"
    );

    private final SkillExtractionService skillExtractionService;

    public ScoringEngineService(SkillExtractionService skillExtractionService) {
        this.skillExtractionService = skillExtractionService;
    }

    /**
     * Performs rule-based skill comparison and transparent scoring.
     *
     * @param resumeText text extracted from the candidate's resume
     * @param jobDescription text of the target job description
     * @return MatchAnalysisResponse containing matched/missing skills and transparent score breakdown
     */
    public MatchAnalysisResponse analyzeMatch(String resumeText, String jobDescription) {
        Set<SkillItem> resumeSkills = skillExtractionService.extractSkills(resumeText);
        Set<SkillItem> jobSkills = skillExtractionService.extractSkills(jobDescription);

        // Calculate matched, missing, and additional skills
        List<SkillItem> matchedSkills = jobSkills.stream()
                .filter(resumeSkills::contains)
                .sorted()
                .toList();

        List<SkillItem> missingSkills = jobSkills.stream()
                .filter(skill -> !resumeSkills.contains(skill))
                .sorted()
                .toList();

        List<SkillItem> additionalSkills = resumeSkills.stream()
                .filter(skill -> !jobSkills.contains(skill))
                .sorted()
                .toList();

        SkillMatchBreakdown skillBreakdown = new SkillMatchBreakdown(
                matchedSkills,
                missingSkills,
                additionalSkills
        );

        // 1. Technical Skills Score (Max 60 points)
        long totalJobTech = jobSkills.stream()
                .filter(s -> s.category() != SkillCategory.SOFT_SKILLS)
                .count();
        long matchedJobTech = matchedSkills.stream()
                .filter(s -> s.category() != SkillCategory.SOFT_SKILLS)
                .count();

        double technicalScore;
        if (totalJobTech > 0) {
            technicalScore = ((double) matchedJobTech / totalJobTech) * 60.0;
        } else {
            // If the job description did not specify explicit technical skills, award baseline
            technicalScore = 60.0;
        }

        // 2. Soft Skills Score (Max 20 points)
        long totalJobSoft = jobSkills.stream()
                .filter(s -> s.category() == SkillCategory.SOFT_SKILLS)
                .count();
        long matchedJobSoft = matchedSkills.stream()
                .filter(s -> s.category() == SkillCategory.SOFT_SKILLS)
                .count();

        double softSkillsScore;
        if (totalJobSoft > 0) {
            softSkillsScore = ((double) matchedJobSoft / totalJobSoft) * 20.0;
        } else {
            // Award partial credit if candidate demonstrates soft skills on resume
            long resumeSoftCount = resumeSkills.stream()
                    .filter(s -> s.category() == SkillCategory.SOFT_SKILLS)
                    .count();
            softSkillsScore = Math.min(20.0, resumeSoftCount * 5.0);
        }

        // 3. Domain Keyword Overlap (Max 20 points)
        double keywordRelevanceScore = calculateKeywordOverlapScore(resumeText, jobDescription);

        // Calculate total score rounded to nearest integer
        double rawTotal = technicalScore + softSkillsScore + keywordRelevanceScore;
        int overallScore = (int) Math.min(100, Math.max(0, Math.round(rawTotal)));

        String verdict = determineVerdict(overallScore);
        String explanation = String.format(
                "Technical skills: %.1f/60 pts (%d/%d matched). Soft skills: %.1f/20 pts. Keyword relevance: %.1f/20 pts.",
                technicalScore, matchedJobTech, Math.max(totalJobTech, 1),
                softSkillsScore, keywordRelevanceScore
        );

        ScoreBreakdown scoreBreakdown = new ScoreBreakdown(
                overallScore,
                roundToOneDecimal(technicalScore),
                roundToOneDecimal(softSkillsScore),
                roundToOneDecimal(keywordRelevanceScore),
                verdict,
                explanation
        );

        return new MatchAnalysisResponse(
                scoreBreakdown,
                skillBreakdown,
                jobSkills.size(),
                resumeSkills.size(),
                matchedSkills.size(),
                missingSkills.size()
        );
    }

    /**
     * Calculates keyword term overlap between resume and job description (excluding common stop words).
     */
    private double calculateKeywordOverlapScore(String resumeText, String jobDescription) {
        Set<String> jdTokens = extractSignificantTokens(jobDescription);
        if (jdTokens.isEmpty()) {
            return 10.0; // neutral baseline
        }

        Set<String> resumeTokens = extractSignificantTokens(resumeText);

        long commonCount = jdTokens.stream()
                .filter(resumeTokens::contains)
                .count();

        double ratio = (double) commonCount / jdTokens.size();
        return Math.min(20.0, Math.max(0.0, ratio * 20.0));
    }

    private Set<String> extractSignificantTokens(String text) {
        if (text == null) {
            return Collections.emptySet();
        }
        var matcher = WORD_PATTERN.matcher(text.toLowerCase(Locale.ROOT));
        Set<String> tokens = new HashSet<>();
        while (matcher.find()) {
            String word = matcher.group();
            if (!STOP_WORDS.contains(word)) {
                tokens.add(word);
            }
        }
        return tokens;
    }

    private String determineVerdict(int score) {
        if (score >= 80) {
            return "Strong Candidate Match";
        } else if (score >= 65) {
            return "Good Match with Target Areas";
        } else if (score >= 45) {
            return "Moderate Match - Skill Gaps Present";
        } else {
            return "Low Match - Significant Keyword & Skill Gaps";
        }
    }

    private double roundToOneDecimal(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}
