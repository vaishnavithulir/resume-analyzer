import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, Sparkles, TrendingUp, CheckCircle2, PlusCircle, ArrowUpRight, HelpCircle, RefreshCw } from 'lucide-react';

export default function ScoreGauge({ score, missingSkills = [], onAskCoach }) {
  if (!score) return null;

  const { overallScore, technicalScore, softSkillsScore, keywordRelevanceScore, verdict, rubricSummary } = score;

  // Animated Count-Up State
  const [animatedScore, setAnimatedScore] = useState(0);

  // Interactive What-If Simulator State
  const [simulatedSkills, setSimulatedSkills] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);

  useEffect(() => {
    // Smooth number count-up animation
    let start = 0;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = overallScore / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= overallScore) {
        setAnimatedScore(overallScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [overallScore]);

  // Recalculate score if simulator skills are checked
  const simulatedBonus = simulatedSkills.length * 8; // ~8 points per bridged skill
  const effectiveScore = Math.min(100, (simulatedSkills.length > 0 ? overallScore : animatedScore) + simulatedBonus);

  // SVG Gauge Calculations
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (effectiveScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 65) return '#06b6d4';
    if (s >= 45) return '#f59e0b';
    return '#ef4444';
  };

  const getVerdictClass = (s) => {
    if (s >= 80) return 'verdict-strong';
    if (s >= 65) return 'verdict-good';
    if (s >= 45) return 'verdict-moderate';
    return 'verdict-low';
  };

  const getVerdictLabel = (s) => {
    if (s >= 80) return 'Strong Match (ATS Ready)';
    if (s >= 65) return 'Good Match (Target Achieved)';
    if (s >= 45) return 'Moderate Match (Needs Optimization)';
    return 'Low Match (Significant Gaps)';
  };

  const scoreColor = getColor(effectiveScore);

  const toggleSimulatedSkill = (skillName) => {
    if (simulatedSkills.includes(skillName)) {
      setSimulatedSkills(simulatedSkills.filter((s) => s !== skillName));
    } else {
      setSimulatedSkills([...simulatedSkills, skillName]);
    }
  };

  return (
    <div className="glass-card interactive-card score-hero-card" style={{ marginBottom: '2rem' }}>
      <div className="score-hero-grid">
        {/* SVG Circular Dial */}
        <div className="gauge-wrapper">
          <svg className="gauge-svg" viewBox="0 0 130 130">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor={scoreColor} />
              </linearGradient>
            </defs>
            <circle
              className="gauge-bg"
              cx="65"
              cy="65"
              r={radius}
            />
            <circle
              className="gauge-fill"
              cx="65"
              cy="65"
              r={radius}
              stroke="url(#scoreGradient)"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div className="gauge-text">
            <span className="gauge-number" style={{ color: scoreColor }}>
              {effectiveScore}%
            </span>
            <span className="gauge-label">
              {simulatedSkills.length > 0 ? 'Simulated' : 'Overall Match'}
            </span>
          </div>

          {simulatedSkills.length > 0 && (
            <div className="simulated-bonus-chip">
              +{simulatedBonus}% Boost
            </div>
          )}
        </div>

        {/* Breakdown & Rubric Details */}
        <div className="score-details">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <span className={`score-verdict ${getVerdictClass(effectiveScore)}`}>
              {simulatedSkills.length > 0 ? getVerdictLabel(effectiveScore) : verdict}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="badge-transparency">
                <ShieldCheck size={13} color="var(--accent-primary)" />
                <span>60/20/20 Rubric</span>
              </span>
            </div>
          </div>

          <p className="score-summary-text">{rubricSummary}</p>

          {/* Interactive Metric Breakdown Bars */}
          <div className="score-bars">
            {/* Metric 1 */}
            <div
              className={`metric-bar-item interactive-metric ${activeTooltip === 'tech' ? 'active' : ''}`}
              onClick={() => setActiveTooltip(activeTooltip === 'tech' ? null : 'tech')}
            >
              <div className="metric-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Technical Stack Overlap
                  <HelpCircle size={12} color="var(--text-dim)" />
                </span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                  {Math.min(60, technicalScore + simulatedSkills.length * 6)}/60 pts
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-thumb"
                  style={{
                    width: `${(Math.min(60, technicalScore + simulatedSkills.length * 6) / 60) * 100}%`,
                    background: 'var(--accent-primary)',
                  }}
                />
              </div>
              {activeTooltip === 'tech' && (
                <div className="metric-explainer-pop">
                  Calculated from exact taxonomy matches for required languages, frameworks, and databases (60% total weight).
                </div>
              )}
            </div>

            {/* Metric 2 */}
            <div
              className={`metric-bar-item interactive-metric ${activeTooltip === 'soft' ? 'active' : ''}`}
              onClick={() => setActiveTooltip(activeTooltip === 'soft' ? null : 'soft')}
            >
              <div className="metric-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Soft Skills & Methodologies
                  <HelpCircle size={12} color="var(--text-dim)" />
                </span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{softSkillsScore}/20 pts</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-thumb"
                  style={{ width: `${(softSkillsScore / 20) * 100}%`, background: 'var(--accent-secondary)' }}
                />
              </div>
              {activeTooltip === 'soft' && (
                <div className="metric-explainer-pop">
                  Evaluates SDLC practices like Agile, Scrum, Testing/JUnit, and team collaboration practices (20% total weight).
                </div>
              )}
            </div>

            {/* Metric 3 */}
            <div
              className={`metric-bar-item interactive-metric ${activeTooltip === 'density' ? 'active' : ''}`}
              onClick={() => setActiveTooltip(activeTooltip === 'density' ? null : 'density')}
            >
              <div className="metric-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Domain Keyword Density
                  <HelpCircle size={12} color="var(--text-dim)" />
                </span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{keywordRelevanceScore}/20 pts</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-thumb"
                  style={{ width: `${(keywordRelevanceScore / 20) * 100}%`, background: 'var(--info)' }}
                />
              </div>
              {activeTooltip === 'density' && (
                <div className="metric-explainer-pop">
                  Measures terminology frequency, architectural phrasing, and contextual relevance between resume and JD (20% total weight).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive What-If Simulator Drawer */}
      {missingSkills && missingSkills.length > 0 && (
        <div className="what-if-simulator-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={16} color="var(--accent-primary)" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Interactive What-If Simulator:
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Check skills to simulate your score improvement live
              </span>
            </div>

            {simulatedSkills.length > 0 && (
              <button
                type="button"
                className="btn-micro-reset"
                onClick={() => setSimulatedSkills([])}
              >
                <RefreshCw size={11} /> Reset Simulation
              </button>
            )}
          </div>

          <div className="simulator-chips-grid">
            {missingSkills.slice(0, 6).map((skill, idx) => {
              const isChecked = simulatedSkills.includes(skill.name);
              return (
                <div
                  key={idx}
                  className={`simulator-chip ${isChecked ? 'selected' : ''}`}
                  onClick={() => toggleSimulatedSkill(skill.name)}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent div
                    style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <span className="sim-skill-name">{skill.name}</span>
                  <span className="sim-skill-pts">+{8}%</span>
                  {onAskCoach && (
                    <button
                      type="button"
                      className="sim-ask-btn"
                      title={`Ask AI coach how to add ${skill.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskCoach(`How can I naturally incorporate ${skill.name} into my projects?`);
                      }}
                    >
                      <ArrowUpRight size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
