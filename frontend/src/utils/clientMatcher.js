import skillsData from './skills-dictionary.json';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', "aren't",
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
  "can't", 'cannot', 'could', "couldn't", 'did', "didn't", 'do', 'does', "doesn't", 'doing', "don't",
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', "hadn't", 'has', "hasn't", 'have',
  "haven't", 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i',
  'if', 'in', 'into', 'is', "isn't", 'it', 'its', 'itself', "let's", 'me', 'more', 'most', "mustn't",
  'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', "shan't", 'she', 'should', "shouldn't", 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', "wasn't", 'we',
  'were', "weren't", 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', "won't",
  'would', "wouldn't", 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

// Build regex patterns for skills
const compiledRules = (skillsData.skills || []).map(skill => {
  const terms = [skill.name, ...(skill.aliases || [])];
  const patterns = terms.map(term => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // For non-word symbols like C++, C#, .NET use custom boundary
    if (/[#+]/.test(term)) {
      return new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i');
    }
    return new RegExp(`\\b${escaped}\\b`, 'i');
  });

  return {
    skill: { name: skill.name, category: skill.category },
    patterns
  };
});

export function extractSkillsClient(text) {
  if (!text || typeof text !== 'string') return [];
  const found = new Map();

  for (const rule of compiledRules) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        found.set(rule.skill.name, rule.skill);
        break;
      }
    }
  }

  return Array.from(found.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function analyzeMatchClient(resumeText, jobDescription) {
  const resumeSkills = extractSkillsClient(resumeText);
  const jobSkills = extractSkillsClient(jobDescription);

  const resumeSkillsMap = new Map(resumeSkills.map(s => [s.name, s]));
  const jobSkillsMap = new Map(jobSkills.map(s => [s.name, s]));

  const matchedSkills = jobSkills.filter(s => resumeSkillsMap.has(s.name));
  const missingSkills = jobSkills.filter(s => !resumeSkillsMap.has(s.name));
  const additionalSkills = resumeSkills.filter(s => !jobSkillsMap.has(s.name));

  // 1. Technical Score (60 pts max)
  const totalJobTech = jobSkills.filter(s => s.category !== 'SOFT_SKILLS').length;
  const matchedJobTech = matchedSkills.filter(s => s.category !== 'SOFT_SKILLS').length;
  const technicalScore = totalJobTech > 0 ? (matchedJobTech / totalJobTech) * 60 : 60.0;

  // 2. Soft Skills Score (20 pts max)
  const totalJobSoft = jobSkills.filter(s => s.category === 'SOFT_SKILLS').length;
  const matchedJobSoft = matchedSkills.filter(s => s.category === 'SOFT_SKILLS').length;
  const softSkillsScore = totalJobSoft > 0 ? (matchedJobSoft / totalJobSoft) * 20 : 15.0;

  // 3. Keyword Relevance Score (20 pts max)
  const tokenize = str => (str.toLowerCase().match(/[a-zA-Z0-9#+.-]{2,}/g) || []).filter(w => !STOP_WORDS.has(w));
  const resumeTokens = new Set(tokenize(resumeText));
  const jobTokens = new Set(tokenize(jobDescription));

  let overlap = 0;
  for (const token of jobTokens) {
    if (resumeTokens.has(token)) overlap++;
  }
  const keywordRelevanceScore = jobTokens.size > 0 ? Math.min(20, (overlap / jobTokens.size) * 20 * 1.5) : 15.0;

  const rawOverall = Math.round(technicalScore + softSkillsScore + keywordRelevanceScore);
  const overallScore = Math.min(100, Math.max(0, rawOverall));

  let verdict = 'Needs Alignment';
  if (overallScore >= 80) verdict = 'Strong Candidate Match';
  else if (overallScore >= 65) verdict = 'Good Match with Target Areas';

  const rubricSummary = `Technical skills: ${technicalScore.toFixed(1)}/60 pts (${matchedJobTech}/${totalJobTech || 'all'} matched). Soft skills: ${softSkillsScore.toFixed(1)}/20 pts. Keyword relevance: ${keywordRelevanceScore.toFixed(1)}/20 pts.`;

  return {
    score: {
      overallScore,
      technicalScore: Math.round(technicalScore * 10) / 10,
      softSkillsScore: Math.round(softSkillsScore * 10) / 10,
      keywordRelevanceScore: Math.round(keywordRelevanceScore * 10) / 10,
      verdict,
      rubricSummary
    },
    skills: {
      matchedSkills,
      missingSkills,
      additionalSkills
    },
    jobSkillsCount: jobSkills.length,
    resumeSkillsCount: resumeSkills.length,
    matchedCount: matchedSkills.length,
    missingCount: missingSkills.length
  };
}

export function generateAdviceClient(resumeText, jobDescription, matchAnalysis) {
  const missing = matchAnalysis.skills.missingSkills || [];
  const matched = matchAnalysis.skills.matchedSkills || [];

  const skillRecommendations = missing.map(skill => ({
    skillName: skill.name,
    category: skill.category,
    recommendedAction: `Incorporate hands-on experience or a featured project utilizing ${skill.name} in your portfolio to close this requirement gap.`,
    suggestedProject: `Build an enterprise module utilizing ${skill.name} with automated tests, Docker containerization, and RESTful documentation.`
  }));

  const bulletImprovements = [
    {
      originalBullet: "Worked on full-stack application modules and backend APIs.",
      improvedBullet: "Engineered 15+ production-grade RESTful endpoints with sub-second response times, integrating robust schema validation and automated integration tests.",
      formulaApplied: "Accomplished [15+ endpoints] as measured by [sub-second latency] by doing [robust validation and automated tests].",
      reasoning: "Replaces passive duty phrasing with active engineering verbs, quantifiable metrics, and verified quality standards."
    },
    {
      originalBullet: "Handled database queries and optimized data models.",
      improvedBullet: "Architected relational schemas and optimized queries with Spring Data JPA/Hibernate and MySQL, reducing database overhead by 30%.",
      formulaApplied: "Accomplished [optimized data access] as measured by [30% lower overhead] by doing [Spring Data JPA schema tuning].",
      reasoning: "Highlights specific technology choices and concrete system performance enhancements."
    }
  ];

  const overallScore = matchAnalysis.score.overallScore;
  let overallRecommendation = `Your profile demonstrates strong engineering fundamentals with ${matched.length} verified technical matches. `;
  if (missing.length > 0) {
    overallRecommendation += `To maximize your ATS match score for this position, incorporate targeted experience with ${missing.slice(0, 3).map(s => s.name).join(', ')}.`;
  } else {
    overallRecommendation += `Your skill profile perfectly covers the core requirements for this position. Focus on articulating quantifiable impact during technical interviews.`;
  }

  return {
    overallRecommendation,
    bulletImprovements,
    skillRecommendations
  };
}
