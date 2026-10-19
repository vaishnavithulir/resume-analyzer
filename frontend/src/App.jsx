import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import JobDescriptionInput from './components/JobDescriptionInput';
import ScoreGauge from './components/ScoreGauge';
import SkillsComparison from './components/SkillsComparison';
import AiInsights from './components/AiInsights';
import HistoryDrawer from './components/HistoryDrawer';
import AuthModal from './components/AuthModal';
import ChatAssistant from './components/ChatAssistant';
import ResumeStudio from './components/ResumeStudio';
import SkillsTaxonomyViewer from './components/SkillsTaxonomyViewer';
import InterviewPrepView from './components/InterviewPrepView';
import Toast from './components/Toast';
import { analyzeFull, getHistory, getMe, getStoredUser, clearAuth } from './services/api';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  BookmarkCheck,
  FileSearch,
  Copy,
  Check,
  Printer,
  RotateCcw,
  MessageSquare,
  Zap,
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('engine'); // 'engine' | 'studio' | 'taxonomy' | 'interview'

  // Input states
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [candidateName, setCandidateName] = useState(() => {
    const existing = getStoredUser();
    return existing ? existing.fullName : 'Priya Sharma';
  });
  const [jobTitle, setJobTitle] = useState('Java Backend SDE');
  const [saveToHistory, setSaveToHistory] = useState(true);

  // Analysis Result State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  // Chat Prompt Trigger
  const [chatPrompt, setChatPrompt] = useState(null);
  const [copiedReport, setCopiedReport] = useState(false);

  // Toast Notification System
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Authentication State
  const [user, setUser] = useState(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchHistoryCount = async () => {
    try {
      const data = await getHistory(0, 1);
      setHistoryCount(data.totalElements || 0);
    } catch {
      // Quiet fail if backend is restarting
    }
  };

  useEffect(() => {
    fetchHistoryCount();

    getMe()
      .then((profile) => {
        if (profile) {
          setUser(profile);
          setCandidateName(profile.fullName);
        }
      })
      .catch(() => {});
  }, []);

  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    if (loggedUser && loggedUser.fullName) {
      setCandidateName(loggedUser.fullName);
    }
    fetchHistoryCount();
    showToast(`Welcome back, ${loggedUser.fullName}!`, 'success');
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setCandidateName('Priya Sharma');
    fetchHistoryCount();
    showToast('Signed out successfully.', 'info');
  };

  const handleAskCoach = (promptText) => {
    setChatPrompt(promptText);
  };

  const handleApplyBulletToResume = (bulletText) => {
    const clean = bulletText.replace(/^[-*•]\s*/, '').trim();
    setResumeText((prev) => (prev ? `${prev}\n• ${clean}` : `• ${clean}`));
    showToast(`Added optimized bullet to your active resume!`, 'success', 'Bullet Merged');
  };

  const handleResetAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    showToast('Session reset. Ready for new analysis.', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyFromStudio = (newResumeText, name) => {
    setResumeText(newResumeText);
    if (name) setCandidateName(name);
    setFile(null);
    setActiveView('engine');
    showToast('Transferred from Resume Studio! Click Analyze when ready.', 'success');
  };

  const handleAddSkillFromTaxonomy = (skillName) => {
    if (!resumeText.toLowerCase().includes(skillName.toLowerCase())) {
      setResumeText((prev) => (prev ? `${prev}\n• Added Skill: ${skillName}` : skillName));
      showToast(`Added "${skillName}" to active resume text!`, 'success');
    } else {
      showToast(`"${skillName}" is already present in your resume!`, 'info');
    }
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const { score, skills } = analysisResult.matchAnalysis;
    const { professionalSummarySuggestion, bulletImprovements } = analysisResult.aiAdvice;

    const report = `# AI RESUME & ATS MATCH REPORT
Candidate: ${candidateName} | Target Role: ${jobTitle}
Overall ATS Match Score: ${score.overallScore}/100 (${score.verdict})

RUBRIC BREAKDOWN:
• Technical Skills: ${score.technicalScore}/60 pts
• Soft Skills: ${score.softSkillsScore}/20 pts
• Keyword Relevance: ${score.keywordRelevanceScore}/20 pts

MATCHED SKILLS (${skills.matchedSkills.length}):
${skills.matchedSkills.map((s) => `• ${s.name} (${s.category})`).join('\n')}

MISSING JOB REQUIREMENTS (${skills.missingSkills.length}):
${skills.missingSkills.map((s) => `• ${s.name} (${s.category})`).join('\n')}

RECOMMENDED PROFESSIONAL SUMMARY:
"${professionalSummarySuggestion || 'N/A'}"

OPTIMIZED HIGH-IMPACT BULLET POINTS:
${(bulletImprovements || []).map((b, i) => `${i + 1}. ${b.improvedBullet}`).join('\n')}
`;

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    showToast('Complete ATS Audit Report copied to clipboard!', 'success');
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError(null);

    if (!resumeText || resumeText.trim().length < 20) {
      setError('Please upload a resume or paste at least 20 characters of resume text.');
      showToast('Resume content is required.', 'warning');
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      setError('Please provide a job description containing at least 20 characters.');
      showToast('Target job description is required.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const result = await analyzeFull({
        resumeText: resumeText.trim(),
        jobDescription: jobDescription.trim(),
        save: saveToHistory,
        candidateName: candidateName.trim(),
        jobTitle: jobTitle.trim(),
      });

      setAnalysisResult(result);
      if (saveToHistory) {
        fetchHistoryCount();
      }
      showToast(
        `Analysis complete! Overall ATS Match Score: ${result.matchAnalysis.score.overallScore}%`,
        'success'
      );
    } catch (err) {
      setError(err.message || 'An error occurred during resume analysis.');
      showToast(err.message || 'Analysis failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistoricalRecord = (record) => {
    try {
      const matchedSkills = record.matchedSkillsJson ? JSON.parse(record.matchedSkillsJson) : [];
      const missingSkills = record.missingSkillsJson ? JSON.parse(record.missingSkillsJson) : [];
      const additionalSkills = record.additionalSkillsJson ? JSON.parse(record.additionalSkillsJson) : [];
      const bulletImprovements = record.bulletImprovementsJson ? JSON.parse(record.bulletImprovementsJson) : [];
      const skillRecommendations = record.skillRecommendationsJson ? JSON.parse(record.skillRecommendationsJson) : [];

      setAnalysisResult({
        matchAnalysis: {
          score: {
            overallScore: record.overallScore,
            technicalScore: record.technicalScore,
            softSkillsScore: record.softSkillsScore,
            keywordRelevanceScore: record.keywordRelevanceScore,
            verdict: record.verdict,
            rubricSummary: record.rubricSummary,
          },
          skills: {
            matchedSkills,
            missingSkills,
            additionalSkills,
          },
        },
        aiAdvice: {
          professionalSummarySuggestion: record.professionalSummary,
          bulletImprovements,
          skillRecommendations,
          keyStrengths: [
            `Top skills verified: ${matchedSkills.slice(0, 4).map((s) => s.name).join(', ')}`,
            'Consistent technical architecture presentation',
          ],
          criticalImprovements: [
            missingSkills.length > 0
              ? `Address key missing requirements: ${missingSkills.slice(0, 3).map((s) => s.name).join(', ')}`
              : 'Add quantifiable metrics to project outcomes',
          ],
          advisorySource: record.advisorySource || 'RULE_BASED_FALLBACK',
        },
      });

      setCandidateName(record.candidateName);
      setJobTitle(record.targetJobTitle);
      setActiveView('engine');
      showToast(`Loaded historical analysis from ${new Date(record.createdAt).toLocaleDateString()}`, 'info');
    } catch (err) {
      setError('Failed to deserialize historical record details: ' + err.message);
      showToast('Failed to load record.', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Ambient Floating Glow Backdrop */}
      <div className="ambient-orb orb-primary" />
      <div className="ambient-orb orb-secondary" />

      {/* Dynamic Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Navigation */}
      <Navbar
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyCount}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* VIEW 1: MATCH ENGINE (Core Analyzer) */}
      {activeView === 'engine' && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
          <section className="hero-banner">
            <div className="hero-pill">
              <Sparkles size={14} />
              <span>Next-Gen Engineering Career & Placement Studio</span>
            </div>
            <h1 className="hero-title">
              Architect Your Engineering Career with <span>Precision AI</span>
            </h1>
            <p className="hero-desc">
              Benchmark your technical profile against enterprise software engineering roles, simulate breakthrough score gains with live gap analysis, and generate recruiter-grade project achievements.
            </p>
          </section>

          {error && (
            <div
              style={{
                maxWidth: '1000px',
                margin: '0 auto 1.5rem',
                padding: '1rem 1.25rem',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.92rem',
              }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <main className="main-grid">
            {/* Left Column: Form Inputs */}
            <section>
              <form onSubmit={handleAnalyze}>
                <FileUpload
                  file={file}
                  setFile={setFile}
                  resumeText={resumeText}
                  setResumeText={setResumeText}
                  setError={setError}
                  onCandidateDetected={(name) => {
                    setCandidateName(name);
                    showToast(`Detected candidate: ${name}`, 'info');
                  }}
                />

                <JobDescriptionInput
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                />

                {/* Candidate Metadata */}
                <div className="glass-card interactive-card" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Candidate Name / Tag</label>
                      <input
                        type="text"
                        className="form-input"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Target Role Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Java Backend SDE"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1rem' }}>
                    <input
                      type="checkbox"
                      id="saveHistory"
                      checked={saveToHistory}
                      onChange={(e) => setSaveToHistory(e.target.checked)}
                      style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                    />
                    <label
                      htmlFor="saveHistory"
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <BookmarkCheck size={14} color="var(--accent-primary)" />
                      <span>Persist report to database history drawer</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-analyze"
                  disabled={loading}
                  id="btn-analyze-submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="spinner" size={20} />
                      <span>Cross-Referencing Requirements & Consulting AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>Analyze Resume & Launch Interactive Audit</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Right Column: Live Analysis Dashboard */}
            <section>
              {loading && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
                  <div className="pulse-glow-circle">
                    <Loader2 className="spinner" size={48} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                    Analyzing Profile & Cross-Referencing Requirements
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
                    Parsing skills taxonomy, calculating 60/20/20 rubric scores, and formulating high-impact achievement transformations...
                  </p>
                </div>
              )}

              {!loading && !analysisResult && (
                <div className="glass-card empty-state">
                  <FileSearch className="empty-icon" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Ready for Interactive Analysis
                  </h3>
                  <p style={{ maxWidth: '450px', margin: '0 auto', fontSize: '0.92rem' }}>
                    Upload your resume document or click <strong style={{ color: '#c7d2fe' }}>Load Sample Resume</strong> on the left, select a target role, and run analysis to unlock interactive score simulations and AI coaching.
                  </p>
                </div>
              )}

              {!loading && analysisResult && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  {/* Interactive Report Actions Bar */}
                  <div className="report-action-toolbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="live-pill-badge">
                        <span className="live-dot" /> Audit Active
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {candidateName} • {jobTitle}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-toolbar"
                        onClick={handleCopyReport}
                        title="Copy full Markdown report to clipboard"
                      >
                        {copiedReport ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                        <span>{copiedReport ? 'Report Copied!' : 'Copy Audit'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-toolbar"
                        onClick={handlePrint}
                        title="Print or export as PDF"
                      >
                        <Printer size={14} />
                        <span>Print/PDF</span>
                      </button>

                      <button
                        type="button"
                        className="btn-toolbar primary"
                        onClick={() => handleAskCoach('What is the single most important change I should make to my resume first?')}
                        title="Consult ResumeAI Coach"
                      >
                        <MessageSquare size={14} />
                        <span>Ask Coach</span>
                      </button>

                      <button
                        type="button"
                        className="btn-toolbar"
                        onClick={handleResetAnalysis}
                        title="Clear current report and start new analysis"
                      >
                        <RotateCcw size={14} />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Score Gauge with Interactive Simulator */}
                  <ScoreGauge
                    score={analysisResult.matchAnalysis.score}
                    missingSkills={analysisResult.matchAnalysis.skills.missingSkills}
                    onAskCoach={handleAskCoach}
                  />

                  {/* Interactive Skills Alignment Matrix */}
                  <SkillsComparison
                    skills={analysisResult.matchAnalysis.skills}
                    onAskCoach={handleAskCoach}
                  />

                  {/* AI Insights & Bullet Enhancer with Interactive Playground */}
                  <AiInsights
                    advice={analysisResult.aiAdvice}
                    onAskCoach={handleAskCoach}
                    onApplyBullet={handleApplyBulletToResume}
                  />
                </div>
              )}
            </section>
          </main>
        </div>
      )}

      {/* VIEW 2: LIVE RESUME STUDIO */}
      {activeView === 'studio' && (
        <ResumeStudio
          onApplyToMatchEngine={handleApplyFromStudio}
          showToast={showToast}
          onAskCoach={handleAskCoach}
        />
      )}

      {/* VIEW 3: SKILLS UNIVERSE & TAXONOMY */}
      {activeView === 'taxonomy' && (
        <SkillsTaxonomyViewer
          onAskCoach={handleAskCoach}
          onAddSkillToResume={handleAddSkillFromTaxonomy}
        />
      )}

      {/* VIEW 4: INTERVIEW QUESTION SIMULATOR */}
      {activeView === 'interview' && (
        <InterviewPrepView onAskCoach={handleAskCoach} />
      )}

      {/* Slide-out History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadRecord={handleLoadHistoricalRecord}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Connected AI Chat Assistant */}
      <ChatAssistant
        context={{
          candidateName: candidateName || (user ? user.fullName : 'Candidate'),
          targetJobTitle: jobTitle || 'Software Engineer',
          overallScore: analysisResult ? analysisResult.matchAnalysis.score.overallScore : 0,
          matchedSkills: analysisResult ? analysisResult.matchAnalysis.skills.matchedSkills.map((s) => s.name) : [],
          missingSkills: analysisResult ? analysisResult.matchAnalysis.skills.missingSkills.map((s) => s.name) : [],
          resumeSnippet: resumeText ? resumeText.substring(0, 600) : '',
          jobDescriptionSnippet: jobDescription ? jobDescription.substring(0, 600) : '',
        }}
        triggerPrompt={chatPrompt}
        onPromptConsumed={() => setChatPrompt(null)}
        onInsertBullet={handleApplyBulletToResume}
      />
    </div>
  );
}
