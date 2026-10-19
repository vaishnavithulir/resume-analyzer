package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.model.SkillCategory;
import com.resumeanalyzer.model.SkillItem;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class SkillExtractionService {

    private static final Logger log = LoggerFactory.getLogger(SkillExtractionService.class);

    private final ObjectMapper objectMapper;
    private final List<SkillRule> skillRules = new ArrayList<>();

    public SkillExtractionService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void initTaxonomy() {
        try {
            ClassPathResource resource = new ClassPathResource("skills-dictionary.json");
            try (InputStream is = resource.getInputStream()) {
                JsonNode root = objectMapper.readTree(is);
                JsonNode skillsNode = root.get("skills");

                if (skillsNode != null && skillsNode.isArray()) {
                    for (JsonNode node : skillsNode) {
                        String name = node.get("name").asText();
                        String categoryStr = node.get("category").asText();
                        SkillCategory category = SkillCategory.valueOf(categoryStr);

                        List<String> terms = new ArrayList<>();
                        terms.add(name);

                        JsonNode aliasesNode = node.get("aliases");
                        if (aliasesNode != null && aliasesNode.isArray()) {
                            for (JsonNode alias : aliasesNode) {
                                terms.add(alias.asText());
                            }
                        }

                        // Build regex patterns with safe boundary recognition for symbols like C++, C#, .NET
                        List<Pattern> patterns = terms.stream()
                                .map(this::buildBoundaryPattern)
                                .toList();

                        skillRules.add(new SkillRule(new SkillItem(name, category), patterns));
                    }
                }
            }
            log.info("Initialized Skills Taxonomy with {} skill entries.", skillRules.size());
        } catch (Exception e) {
            log.error("Failed to load skills-dictionary.json from classpath", e);
            throw new IllegalStateException("Could not load skills taxonomy", e);
        }
    }

    /**
     * Extracts all unique canonical skills from the provided text.
     *
     * @param text document or job description text
     * @return Set of matched SkillItems
     */
    public Set<SkillItem> extractSkills(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptySet();
        }

        // Add padding spaces to allow boundary detection at string edges
        String paddedText = " " + text + " ";
        Set<SkillItem> detectedSkills = new TreeSet<>();

        for (SkillRule rule : skillRules) {
            for (Pattern pattern : rule.patterns()) {
                if (pattern.matcher(paddedText).find()) {
                    detectedSkills.add(rule.skillItem());
                    break; // Matched this skill, no need to check other aliases
                }
            }
        }

        return detectedSkills;
    }

    /**
     * Constructs a regex pattern that matches the term surrounded by punctuation, whitespace, or boundaries.
     * Handles non-alphanumeric special characters like C++, C#, .NET, Node.js safely.
     */
    private Pattern buildBoundaryPattern(String term) {
        String quotedTerm = Pattern.quote(term.trim());
        // Match term bounded by start/end, whitespace, or common punctuation
        String regex = "(?i)(?<=^|[\\s,;:.()\\[\\]{}'\"/\\\\|<>?!@#$%^&*~`+=—–-])"
                + quotedTerm
                + "(?=$|[\\s,;:.()\\[\\]{}'\"/\\\\|<>?!@#$%^&*~`+=—–-])";
        return Pattern.compile(regex);
    }

    public List<SkillRule> getSkillRules() {
        return Collections.unmodifiableList(skillRules);
    }

    public record SkillRule(SkillItem skillItem, List<Pattern> patterns) {}
}
