package com.resumeanalyzer.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "analysis_records")
public class AnalysisRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String candidateName;

    @Column(nullable = false)
    private String targetJobTitle;

    @Column(nullable = false)
    private int overallScore;

    @Column(nullable = false)
    private double technicalScore;

    @Column(nullable = false)
    private double softSkillsScore;

    @Column(nullable = false)
    private double keywordRelevanceScore;

    @Column(nullable = false)
    private String verdict;

    @Column(length = 1000)
    private String rubricSummary;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String matchedSkillsJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String missingSkillsJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String additionalSkillsJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String professionalSummary;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String bulletImprovementsJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String skillRecommendationsJson;

    private String advisorySource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public AnalysisRecord() {
    }

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getTargetJobTitle() {
        return targetJobTitle;
    }

    public void setTargetJobTitle(String targetJobTitle) {
        this.targetJobTitle = targetJobTitle;
    }

    public int getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(int overallScore) {
        this.overallScore = overallScore;
    }

    public double getTechnicalScore() {
        return technicalScore;
    }

    public void setTechnicalScore(double technicalScore) {
        this.technicalScore = technicalScore;
    }

    public double getSoftSkillsScore() {
        return softSkillsScore;
    }

    public void setSoftSkillsScore(double softSkillsScore) {
        this.softSkillsScore = softSkillsScore;
    }

    public double getKeywordRelevanceScore() {
        return keywordRelevanceScore;
    }

    public void setKeywordRelevanceScore(double keywordRelevanceScore) {
        this.keywordRelevanceScore = keywordRelevanceScore;
    }

    public String getVerdict() {
        return verdict;
    }

    public void setVerdict(String verdict) {
        this.verdict = verdict;
    }

    public String getRubricSummary() {
        return rubricSummary;
    }

    public void setRubricSummary(String rubricSummary) {
        this.rubricSummary = rubricSummary;
    }

    public String getMatchedSkillsJson() {
        return matchedSkillsJson;
    }

    public void setMatchedSkillsJson(String matchedSkillsJson) {
        this.matchedSkillsJson = matchedSkillsJson;
    }

    public String getMissingSkillsJson() {
        return missingSkillsJson;
    }

    public void setMissingSkillsJson(String missingSkillsJson) {
        this.missingSkillsJson = missingSkillsJson;
    }

    public String getAdditionalSkillsJson() {
        return additionalSkillsJson;
    }

    public void setAdditionalSkillsJson(String additionalSkillsJson) {
        this.additionalSkillsJson = additionalSkillsJson;
    }

    public String getProfessionalSummary() {
        return professionalSummary;
    }

    public void setProfessionalSummary(String professionalSummary) {
        this.professionalSummary = professionalSummary;
    }

    public String getBulletImprovementsJson() {
        return bulletImprovementsJson;
    }

    public void setBulletImprovementsJson(String bulletImprovementsJson) {
        this.bulletImprovementsJson = bulletImprovementsJson;
    }

    public String getSkillRecommendationsJson() {
        return skillRecommendationsJson;
    }

    public void setSkillRecommendationsJson(String skillRecommendationsJson) {
        this.skillRecommendationsJson = skillRecommendationsJson;
    }

    public String getAdvisorySource() {
        return advisorySource;
    }

    public void setAdvisorySource(String advisorySource) {
        this.advisorySource = advisorySource;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
