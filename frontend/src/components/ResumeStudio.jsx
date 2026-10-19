import React, { useState, useMemo } from 'react';
import {
  FileEdit,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Wand2,
  Trash2,
  Printer,
} from 'lucide-react';
import PdfResumePreviewModal from './PdfResumePreviewModal';

const INITIAL_RESUME_DATA = {
  name: 'Priya Sharma',
  title: 'Full Stack & Software Development Engineer (MCA 2026)',
  contact: 'priya.sharma@example.com | github.com/priyasharma | linkedin.com/in/priyasharma',
  summary:
    'Results-driven MCA graduate with technical foundations in Java 21, Spring Boot, React 18, and MySQL. Experienced in architecting RESTful microservices, optimizing database performance, and implementing automated testing targeting high-scale software systems.',
  skills:
    'Java, JavaScript, SQL, HTML5, CSS3, Spring Boot, React, Node.js, MySQL, PostgreSQL, Docker, Git, REST APIs, Microservices, JUnit, Agile/Scrum',
  projects: [
    {
      title: 'AI Resume Analyzer & Job Match Engine',
      tech: 'Java 21, Spring Boot, React, MySQL, Apache Tika',
      bullet1:
        'Architected full-stack career advisor processing PDF/DOCX resumes via Apache Tika and calculating transparent match scores using 60/20/20 rubric.',
      bullet2:
        'Built high-performance React 18 dashboard with dynamic glassmorphism UI, real-time score gauge, and interactive AI chatbot assistant.',
      bullet3:
        'Designed JPA persistence layer with dual H2/MySQL profiles supporting encrypted JWT authentication and historical report analytics.',
    },
    {
      title: 'E-Commerce Microservices Platform',
      tech: 'Spring Boot, React, PostgreSQL, Docker',
      bullet1:
        'Developed distributed RESTful services for inventory, user auth, and cart checkout handling 500+ simulated concurrent requests.',
      bullet2:
        'Containerized services using Docker multi-stage builds, cutting staging environment setup time from 35 min to 3 min.',
      bullet3:
        'Implemented robust exception handling, DTO validation, and JUnit test coverage exceeding 85%.',
    },
  ],
  education:
    'Master of Computer Applications (MCA) — 2024 - 2026 | CGPA: 8.8/10\nBachelor of Computer Applications (BCA) — 2021 - 2024 | CGPA: 8.6/10',
};

const STRONG_VERBS = [
  'architected',
  'engineered',
  'optimized',
  'deployed',
  'spearheaded',
  'refactored',
  'designed',
  'developed',
  'containerized',
  'implemented',
  'automated',
  'orchestrated',
  'scaled',
  'integrated',
];

const WEAK_VERBS = ['worked on', 'helped', 'assisted', 'responsible for', 'handled', 'tried to', 'did'];

export default function ResumeStudio({ onApplyToMatchEngine, showToast, onAskCoach }) {
  const [resumeData, setResumeData] = useState(INITIAL_RESUME_DATA);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Dynamic Full Text Compilation
  const compiledResumeText = useMemo(() => {
    let text = `${resumeData.name}\n${resumeData.title}\n${resumeData.contact}\n\n`;
    text += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;
    text += `TECHNICAL SKILLS\n${resumeData.skills}\n\n`;
    text += `PROJECTS\n`;
    resumeData.projects.forEach((p) => {
      text += `${p.title} | ${p.tech}\n`;
      if (p.bullet1) text += `• ${p.bullet1}\n`;
      if (p.bullet2) text += `• ${p.bullet2}\n`;
      if (p.bullet3) text += `• ${p.bullet3}\n`;
      text += `\n`;
    });
    text += `EDUCATION\n${resumeData.education}\n`;
    return text.trim();
  }, [resumeData]);

  // Real-time Dynamic ATS Analysis
  const metrics = useMemo(() => {
    const textLower = compiledResumeText.toLowerCase();
    const words = compiledResumeText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Detect strong verbs
    const foundStrong = STRONG_VERBS.filter((v) => textLower.includes(v));

    // Detect weak verbs
    const foundWeak = WEAK_VERBS.filter((v) => textLower.includes(v));

    // Detect quantified metrics (numbers, %, ms, x, k)
    const metricMatches = compiledResumeText.match(/\b\d+(\.\d+)?(%|x|k|ms|s|\+)?\b/gi) || [];

    // Calculate Dynamic ATS Quality Index (0-100)
    let score = 30; // base for structure
    if (wordCount >= 150 && wordCount <= 600) score += 20;
    else if (wordCount > 600) score += 10;

    score += Math.min(25, foundStrong.length * 5);
    score += Math.min(20, metricMatches.length * 4);
    score -= Math.min(15, foundWeak.length * 5);
    score = Math.max(10, Math.min(98, score));

    return {
      wordCount,
      foundStrong,
      foundWeak,
      metricMatches,
      score,
    };
  }, [compiledResumeText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledResumeText);
    setCopied(true);
    showToast?.('Formatted resume copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToEngine = () => {
    onApplyToMatchEngine(compiledResumeText, resumeData.name);
    showToast?.('Resume transferred to Match Engine! Ready to analyze.', 'success');
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...resumeData.projects];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, projects: updated });
  };

  return (
    <div className="resume-studio-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Studio Header Bar */}
      <div className="studio-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="studio-icon-badge">
            <FileEdit size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Live Interactive Resume Studio
              </h2>
              <span className="live-pill-badge">
                <span className="live-dot" /> Live ATS Evaluator
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Edit resume sections in real-time. The dynamic health engine analyzes your verbs, metrics, and ATS compatibility live as you type.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-toolbar"
            onClick={handleCopy}
            title="Copy compiled resume text"
          >
            {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            className="btn-toolbar"
            onClick={() => setIsPdfModalOpen(true)}
            title="Preview and export formatted ATS-friendly PDF"
            style={{
              background: 'rgba(99, 102, 241, 0.18)',
              borderColor: 'rgba(99, 102, 241, 0.4)',
              color: '#c7d2fe',
            }}
          >
            <Printer size={15} />
            <span>Export ATS PDF</span>
          </button>

          <button
            type="button"
            className="btn-toolbar primary"
            onClick={handleSendToEngine}
            title="Transfer to Match Engine"
          >
            <Zap size={14} />
            <span>Send to Match Engine</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Editor vs Live Telemetry */}
      <div className="studio-grid">
        {/* Left Column: Interactive Section Editor */}
        <div className="studio-editor-pane">
          {/* Candidate Info */}
          <div className="glass-card interactive-card" style={{ marginBottom: '1.25rem' }}>
            <h3 className="section-mini-title">1. Header & Contact Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={resumeData.name}
                  onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Target Role Headline</label>
                <input
                  type="text"
                  className="form-input"
                  value={resumeData.title}
                  onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="form-label">Contact & Portfolio Links</label>
              <input
                type="text"
                className="form-input"
                value={resumeData.contact}
                onChange={(e) => setResumeData({ ...resumeData, contact: e.target.value })}
              />
            </div>
          </div>

          {/* Professional Summary */}
          <div className="glass-card interactive-card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <h3 className="section-mini-title" style={{ margin: 0 }}>2. Professional Summary</h3>
              {onAskCoach && (
                <button
                  type="button"
                  className="btn-copy-micro"
                  onClick={() => onAskCoach('Help me write an eye-catching 2-line summary for my resume.')}
                >
                  <Wand2 size={12} color="var(--accent-primary)" /> Ask AI Coach
                </button>
              )}
            </div>
            <textarea
              className="form-textarea"
              rows={3}
              value={resumeData.summary}
              onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
            />
          </div>

          {/* Technical Skills */}
          <div className="glass-card interactive-card" style={{ marginBottom: '1.25rem' }}>
            <h3 className="section-mini-title">3. Core Skills (Comma-separated)</h3>
            <textarea
              className="form-textarea"
              rows={3}
              value={resumeData.skills}
              onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value })}
            />
          </div>

          {/* Experience / Projects Bullets */}
          <div className="glass-card interactive-card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 className="section-mini-title" style={{ margin: 0 }}>4. Projects & Quantified Achievements</h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Action Verb + Technical Implementation + Measurable Metric
              </span>
            </div>

            {resumeData.projects.map((proj, pIdx) => (
              <div key={pIdx} className="studio-project-card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={proj.title}
                    placeholder="Project Name"
                    onChange={(e) => handleProjectChange(pIdx, 'title', e.target.value)}
                    style={{ fontWeight: 700 }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={proj.tech}
                    placeholder="Technologies Used"
                    onChange={(e) => handleProjectChange(pIdx, 'tech', e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={proj.bullet1}
                    placeholder="Bullet 1 (Power Verb + Architecture + Outcome)"
                    onChange={(e) => handleProjectChange(pIdx, 'bullet1', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={proj.bullet2}
                    placeholder="Bullet 2 (Optimization + Quantified Metric)"
                    onChange={(e) => handleProjectChange(pIdx, 'bullet2', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={proj.bullet3}
                    placeholder="Bullet 3 (Reliability / Testing / Scaling Impact)"
                    onChange={(e) => handleProjectChange(pIdx, 'bullet3', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="glass-card interactive-card">
            <h3 className="section-mini-title">5. Education & Academics</h3>
            <textarea
              className="form-textarea"
              rows={2}
              value={resumeData.education}
              onChange={(e) => setResumeData({ ...resumeData, education: e.target.value })}
            />
          </div>
        </div>

        {/* Right Column: Live Dynamic Telemetry & Health Panel */}
        <div className="studio-telemetry-pane">
          <div className="glass-card interactive-card sticky-telemetry">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={18} color="var(--accent-primary)" />
              <span>Real-Time ATS Health Telemetry</span>
            </h3>

            {/* Dynamic Score Dial */}
            <div className="telemetry-score-box">
              <div className="telemetry-gauge">
                <span className="telemetry-number" style={{ color: metrics.score >= 75 ? '#10b981' : '#06b6d4' }}>
                  {metrics.score}
                </span>
                <span className="telemetry-sub">/ 100 Quality</span>
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {metrics.score >= 80 ? '🌟 ATS Ready' : metrics.score >= 65 ? '⚡ Strong Draft' : '✍️ Needs Optimization'}
                </h4>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {metrics.wordCount} total words • {metrics.foundStrong.length} strong action verbs
                </p>
              </div>
            </div>

            {/* Action Verbs Analysis */}
            <div className="telemetry-stat-row">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>Power Action Verbs</span>
                <span style={{ color: '#34d399', fontWeight: 800 }}>{metrics.foundStrong.length} detected</span>
              </div>
              <div className="skill-cat-scroll" style={{ marginTop: '0.25rem' }}>
                {metrics.foundStrong.length > 0 ? (
                  metrics.foundStrong.map((v, i) => (
                    <span key={i} className="micro-tag" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      ✓ {v}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    No high-impact verbs detected yet.
                  </span>
                )}
              </div>
            </div>

            {/* Weak Verbs Detection */}
            {metrics.foundWeak.length > 0 && (
              <div className="telemetry-stat-row warning">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>
                  <AlertTriangle size={13} />
                  <span>Passive Phrases Detected ({metrics.foundWeak.length})</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Replace: {metrics.foundWeak.map((w) => `"${w}"`).join(', ')} with strong action verbs.
                </p>
              </div>
            )}

            {/* Quantified Metrics Counter */}
            <div className="telemetry-stat-row">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>Quantified Outcomes</span>
                <span style={{ color: 'var(--accent-secondary)', fontWeight: 800 }}>
                  {metrics.metricMatches.length} metrics
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {metrics.metricMatches.length >= 3
                  ? '✓ Excellent demonstration of measurable engineering impact!'
                  : 'Add numbers, % improvements, latency drops, or request counts to your bullets.'}
              </p>
            </div>

            {/* Live Formatted Preview Card */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                  COMPILED PREVIEW:
                </span>
                <button
                  type="button"
                  className="btn-copy-micro"
                  onClick={handleCopy}
                >
                  <Copy size={11} /> Copy All
                </button>
              </div>

              <div className="studio-preview-box">
                <pre>{compiledResumeText}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 1-Click ATS-Friendly PDF Preview & Exporter Modal */}
      <PdfResumePreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        resumeData={resumeData}
        showToast={showToast}
      />
    </div>
  );
}
