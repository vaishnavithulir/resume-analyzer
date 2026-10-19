import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  Wand2,
  Split,
  Layers,
  Eye,
  PlusCircle,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

// Helper to detect action verbs, metrics, and passive phrases
function analyzeBulletDiff(original, improved) {
  const verbMatch = improved.match(
    /\b(Architected|Engineered|Spearheaded|Optimized|Refactored|Containerized|Automated|Designed|Streamlined|Benchmarked|Deployed|Implemented|Constructed|Pioneered|Orchestrated|Developed|Migrated|Accelerated|Configured|Integrated)\b/i
  );
  const metricMatch = improved.match(
    /\b(\d+(?:\.\d+)?%|\d+x|\d+\+?\s*(?:k|ms|s|sec|seconds|users|requests|req\/s|rps|qps|queries|hours|nodes|test cases)|cutting \w+ by \d+%|latency by \d+%|throughput by \d+%|\$\d+[kKmM]?)\b/i
  );
  const passiveMatch = original.match(
    /\b(worked on|responsible for|helped with|assisted in|handled|did|made|involved in|participated in|tasked with)\b/i
  );

  return {
    verb: verbMatch ? verbMatch[0] : 'Engineered',
    metric: metricMatch ? metricMatch[0] : 'Quantified Impact',
    passivePhrase: passiveMatch ? passiveMatch[0] : null,
  };
}

export default function AiInsights({ advice, onAskCoach, onApplyBullet }) {
  if (!advice) return null;

  const {
    professionalSummarySuggestion,
    bulletImprovements = [],
    skillRecommendations = [],
    keyStrengths = [],
    criticalImprovements = [],
    advisorySource,
  } = advice;

  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);
  const [appliedBulletIdx, setAppliedBulletIdx] = useState(null);

  // Diff view modes: 'split' | 'inline' | 'clean'
  const [diffMode, setDiffMode] = useState('split');

  // Live Impact Bullet Playground State
  const [customBullet, setCustomBullet] = useState('');
  const [selectedVerb, setSelectedVerb] = useState('Architected');
  const [selectedMetric, setSelectedMetric] = useState('32%');
  const [generatedPlaygroundBullet, setGeneratedPlaygroundBullet] = useState(null);
  const [copiedPlayground, setCopiedPlayground] = useState(false);
  const [appliedPlayground, setAppliedPlayground] = useState(false);

  const verbs = ['Architected', 'Engineered', 'Optimized', 'Containerized', 'Spearheaded', 'Refactored', 'Automated'];
  const metrics = ['25%', '32%', '40%', '3x faster', '10k+ requests', '350ms latency'];

  const copySummary = () => {
    if (professionalSummarySuggestion) {
      navigator.clipboard.writeText(professionalSummarySuggestion);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const copyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const handleApplyBullet = (text, idx) => {
    if (onApplyBullet) {
      onApplyBullet(text);
      setAppliedBulletIdx(idx);
      setTimeout(() => setAppliedBulletIdx(null), 2500);
    }
  };

  const generatePlaygroundBullet = () => {
    if (!customBullet.trim()) return;
    const clean = customBullet.trim().replace(/^[-*•]\s*/, '');
    const rewrite = `${selectedVerb} and deployed high-performance solutions for "${clean}", cutting processing latency by ${selectedMetric} and ensuring modular code compliance.`;
    setGeneratedPlaygroundBullet(rewrite);
  };

  const handleApplyPlayground = () => {
    if (generatedPlaygroundBullet && onApplyBullet) {
      onApplyBullet(generatedPlaygroundBullet);
      setAppliedPlayground(true);
      setTimeout(() => setAppliedPlayground(false), 2500);
    }
  };

  return (
    <div className="glass-card interactive-card ai-section" style={{ marginBottom: '2rem' }}>
      {/* Header */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.6rem' }}>
        <div>
          <h2 className="card-title">
            <Sparkles size={20} color="#ec4899" />
            <span>4. AI Advisory & Visual Bullet Diff</span>
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Quantified achievement transformations and visual before/after diffs
          </p>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            background: advisorySource === 'GEMINI_LLM' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            border: `1px solid ${advisorySource === 'GEMINI_LLM' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
            color: advisorySource === 'GEMINI_LLM' ? '#34d399' : '#a5b4fc',
            fontWeight: 700,
          }}
        >
          {advisorySource === 'GEMINI_LLM' ? '✨ Powered by Google Gemini' : '⚡ Rule-Based Match Intelligence'}
        </span>
      </div>

      {/* Recommended Professional Summary */}
      {professionalSummarySuggestion && (
        <div className="summary-card" style={{ marginBottom: '1.75rem' }}>
          <div className="summary-header">
            <div className="summary-title">
              <Lightbulb size={16} />
              <span>Tailored Professional Summary (Ready to Paste)</span>
            </div>
            <button type="button" className="btn-copy" onClick={copySummary}>
              {copiedSummary ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>
          </div>
          <p className="summary-text">{professionalSummarySuggestion}</p>
        </div>
      )}

      {/* Bullet Point Improvements with Visual Diff Selector */}
      {bulletImprovements.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
              flexWrap: 'wrap',
              gap: '0.6rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#cbd5e1' }}>
                High-Impact Project Bullet Transformations
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                "Power Verb + Technical Architecture + Quantified Business Impact"
              </span>
            </div>

            {/* Diff View Mode Switcher */}
            <div className="diff-mode-switcher">
              <button
                type="button"
                className={`diff-mode-btn ${diffMode === 'split' ? 'active' : ''}`}
                onClick={() => setDiffMode('split')}
                title="Side-by-side comparison"
              >
                <Split size={12} />
                <span>Side-by-Side</span>
              </button>
              <button
                type="button"
                className={`diff-mode-btn ${diffMode === 'inline' ? 'active' : ''}`}
                onClick={() => setDiffMode('inline')}
                title="Inline diff highlighting"
              >
                <Layers size={12} />
                <span>Inline Diff</span>
              </button>
              <button
                type="button"
                className={`diff-mode-btn ${diffMode === 'clean' ? 'active' : ''}`}
                onClick={() => setDiffMode('clean')}
                title="Compact view"
              >
                <Eye size={12} />
                <span>Compact</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bulletImprovements.map((b, idx) => {
              const diffAnalysis = analyzeBulletDiff(b.originalBullet, b.improvedBullet);

              return (
                <div key={idx} className="bullet-card interactive-bullet" style={{ position: 'relative' }}>
                  {/* Top Badges Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.65rem',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="diff-pill-badge verb">
                        <Zap size={11} /> Verb: {diffAnalysis.verb}
                      </span>
                      <span className="diff-pill-badge metric">
                        <Flame size={11} /> Metric: {diffAnalysis.metric}
                      </span>
                      <span className="diff-pill-badge signal">
                        <TrendingUp size={11} /> +45% ATS Recruiter Signal
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {onApplyBullet && (
                        <button
                          type="button"
                          className="btn-bullet-action apply"
                          onClick={() => handleApplyBullet(b.improvedBullet, idx)}
                          title="Inject this bullet straight into your active resume"
                        >
                          {appliedBulletIdx === idx ? (
                            <>
                              <CheckCircle2 size={12} color="var(--success)" />
                              <span style={{ color: 'var(--success)' }}>Added to Resume!</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle size={12} />
                              <span>Apply to Resume</span>
                            </>
                          )}
                        </button>
                      )}

                      {onAskCoach && (
                        <button
                          type="button"
                          className="btn-bullet-action"
                          onClick={() =>
                            onAskCoach(`Please rewrite this bullet specifically for my MCA portfolio: "${b.improvedBullet}"`)
                          }
                          title="Refine with AI Coach"
                        >
                          <MessageSquare size={12} /> Refine
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-bullet-action copy"
                        onClick={() => copyBullet(b.improvedBullet, idx)}
                        title="Copy bullet to clipboard"
                      >
                        {copiedBulletIdx === idx ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                        <span>{copiedBulletIdx === idx ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* MODE 1: SIDE-BY-SIDE SPLIT VIEW */}
                  {diffMode === 'split' && (
                    <div className="diff-split-container">
                      <div className="diff-split-col before">
                        <div className="diff-split-header">
                          <span className="diff-label red">Original (Passive / Unquantified)</span>
                          {diffAnalysis.passivePhrase && (
                            <span className="diff-mini-flag">Passive phrasing</span>
                          )}
                        </div>
                        <p className="bullet-before-split">{b.originalBullet}</p>
                      </div>

                      <div className="diff-split-col after">
                        <div className="diff-split-header">
                          <span className="diff-label green">Optimized High-Impact (Active & Measured)</span>
                          <span className="diff-mini-flag green">Recruiter Ready</span>
                        </div>
                        <p className="bullet-after-split">{b.improvedBullet}</p>
                      </div>
                    </div>
                  )}

                  {/* MODE 2: INLINE DIFF VIEW */}
                  {diffMode === 'inline' && (
                    <div className="diff-inline-box">
                      <div className="diff-inline-header">
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                          TRANSFORMATION DELTA:
                        </span>
                      </div>
                      <div className="diff-inline-content">
                        <div className="diff-delta-row">
                          <span className="diff-badge-del">- REMOVED</span>
                          <span className="diff-text-del">{b.originalBullet}</span>
                        </div>
                        <div className="diff-delta-row">
                          <span className="diff-badge-add">+ ADDED</span>
                          <span className="diff-text-add">{b.improvedBullet}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE 3: CLEAN / COMPACT VIEW */}
                  {diffMode === 'clean' && (
                    <div>
                      <p className="bullet-before">{b.originalBullet}</p>
                      <p className="bullet-after">{b.improvedBullet}</p>
                    </div>
                  )}

                  {/* Recruiter Rationale */}
                  <div className="bullet-rationale" style={{ marginTop: '0.65rem' }}>
                    <TrendingUp size={14} color="var(--accent-primary)" />
                    <span>Recruiter Rationale: {b.rationale}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Live Bullet Optimizer Playground */}
      <div className="bullet-playground-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Wand2 size={18} color="var(--accent-secondary)" />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Interactive Bullet Transformer (Live Studio)
          </h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
          Paste any draft sentence from your resume below, choose an action verb and metric target, and generate an executive-ready statement:
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Action Verb:</span>
            {verbs.map((v) => (
              <button
                key={v}
                type="button"
                className={`verb-pill ${selectedVerb === v ? 'active' : ''}`}
                onClick={() => setSelectedVerb(v)}
              >
                {v}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginLeft: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Metric Target:</span>
            {metrics.map((m) => (
              <button
                key={m}
                type="button"
                className={`verb-pill metric-choice ${selectedMetric === m ? 'active' : ''}`}
                onClick={() => setSelectedMetric(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Worked on database queries and connected frontend with Axios"
            value={customBullet}
            onChange={(e) => setCustomBullet(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generatePlaygroundBullet()}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
            onClick={generatePlaygroundBullet}
            disabled={!customBullet.trim()}
          >
            <Sparkles size={14} /> Transform
          </button>
        </div>

        {generatedPlaygroundBullet && (
          <div className="playground-output-box" style={{ animation: 'fadeIn 0.2s ease' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                flexWrap: 'wrap',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)' }}>
                  ✨ Quantified Impact Achievement:
                </span>
                <span className="diff-pill-badge verb">{selectedVerb}</span>
                <span className="diff-pill-badge metric">{selectedMetric}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {onApplyBullet && (
                  <button
                    type="button"
                    className="btn-bullet-action apply"
                    onClick={handleApplyPlayground}
                  >
                    {appliedPlayground ? (
                      <>
                        <CheckCircle2 size={12} color="var(--success)" />
                        <span style={{ color: 'var(--success)' }}>Added to Resume!</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle size={12} />
                        <span>Apply to Resume</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  className="btn-bullet-action copy"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPlaygroundBullet);
                    setCopiedPlayground(true);
                    setTimeout(() => setCopiedPlayground(false), 2000);
                  }}
                >
                  {copiedPlayground ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  <span>{copiedPlayground ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <p className="bullet-after" style={{ margin: 0 }}>{generatedPlaygroundBullet}</p>
          </div>
        )}
      </div>

      {/* Skill Bridging Strategies */}
      {skillRecommendations.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem', color: '#cbd5e1' }}>
            Actionable Project Bridging for Missing Skills
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {skillRecommendations.map((sr, idx) => (
              <div key={idx} className="bridge-card interactive-bridge">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span className="bridge-skill-badge">{sr.skillName}</span>
                  {onAskCoach && (
                    <button
                      type="button"
                      className="btn-bridge-ask"
                      onClick={() => onAskCoach(`Can you give me a step-by-step 1-day project guide to learn and add ${sr.skillName} to my resume?`)}
                    >
                      <MessageSquare size={12} /> Project Guide
                    </button>
                  )}
                </div>
                <p className="bridge-text">{sr.actionableAdvice}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
