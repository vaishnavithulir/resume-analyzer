import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, PlusCircle, Filter, Search, Copy, Check, MessageSquare, ArrowRight, Tag } from 'lucide-react';

export default function SkillsComparison({ skills, onAskCoach }) {
  if (!skills) return null;

  const { matchedSkills = [], missingSkills = [], additionalSkills = [] } = skills;
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'matched' | 'missing' | 'additional'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [copiedType, setCopiedType] = useState(null);

  // Categories list
  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'LANGUAGE', label: 'Languages' },
    { id: 'FRAMEWORK', label: 'Frameworks' },
    { id: 'DATABASE', label: 'Databases' },
    { id: 'CLOUD_DEVOPS', label: 'Cloud & DevOps' },
    { id: 'ARCHITECTURE_METHODOLOGY', label: 'Architecture' },
    { id: 'SOFT_SKILL', label: 'Soft Skills' },
  ];

  const filterList = (list) => {
    return list.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredMatched = filterList(matchedSkills);
  const filteredMissing = filterList(missingSkills);
  const filteredAdditional = filterList(additionalSkills);

  const copySkillList = (list, type) => {
    const text = list.map((s) => s.name).join(', ');
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="glass-card interactive-card" style={{ marginBottom: '2rem' }}>
      {/* Header */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 className="card-title">
            <Filter size={20} color="var(--accent-primary)" />
            <span>3. Skills Alignment Matrix</span>
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Click any skill to view action plans, category breakdown, or consult AI
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn-icon ${activeTab === 'all' ? 'active' : ''}`}
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
            onClick={() => setActiveTab('all')}
          >
            All ({matchedSkills.length + missingSkills.length})
          </button>
          <button
            type="button"
            className={`btn-icon ${activeTab === 'matched' ? 'active' : ''}`}
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderColor: activeTab === 'matched' ? 'var(--success)' : undefined }}
            onClick={() => setActiveTab('matched')}
          >
            Matched ({matchedSkills.length})
          </button>
          <button
            type="button"
            className={`btn-icon ${activeTab === 'missing' ? 'active' : ''}`}
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderColor: activeTab === 'missing' ? 'var(--warning)' : undefined }}
            onClick={() => setActiveTab('missing')}
          >
            Missing ({missingSkills.length})
          </button>
          {additionalSkills.length > 0 && (
            <button
              type="button"
              className={`btn-icon ${activeTab === 'additional' ? 'active' : ''}`}
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => setActiveTab('additional')}
            >
              Bonus ({additionalSkills.length})
            </button>
          )}
        </div>
      </div>

      {/* Interactive Controls Bar: Search + Category Filters */}
      <div className="skills-toolbar">
        {/* Search Input */}
        <div className="skill-search-box">
          <Search size={15} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Filter skills (e.g., React, Java, Docker)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="skill-search-input"
          />
        </div>

        {/* Category Pills */}
        <div className="skill-cat-scroll">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Selected Skill Action Banner */}
      {selectedSkill && (
        <div className="selected-skill-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={16} color="var(--accent-primary)" />
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>
                {selectedSkill.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                Category: <strong>{selectedSkill.category.replace(/_/g, ' ')}</strong> • Status:{' '}
                <strong style={{ color: selectedSkill.status === 'matched' ? 'var(--success)' : 'var(--warning)' }}>
                  {selectedSkill.status === 'matched' ? 'Matched Requirement' : 'Missing Gap'}
                </strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {onAskCoach && (
              <button
                type="button"
                className="btn-pill-ask-coach"
                onClick={() => {
                  onAskCoach(
                    selectedSkill.status === 'matched'
                      ? `How can I best showcase ${selectedSkill.name} in my resume bullets with metrics?`
                      : `How can I naturally incorporate ${selectedSkill.name} into my projects to bridge this gap?`
                  );
                }}
              >
                <MessageSquare size={13} />
                <span>Ask AI Coach</span>
              </button>
            )}
            <button
              type="button"
              className="btn-icon"
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
              onClick={() => setSelectedSkill(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Matched Skills Section */}
      {(activeTab === 'all' || activeTab === 'matched') && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={17} color="var(--success)" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#34d399' }}>
                Matched Requirements ({filteredMatched.length})
              </h3>
            </div>

            {filteredMatched.length > 0 && (
              <button
                type="button"
                className="btn-copy-micro"
                onClick={() => copySkillList(filteredMatched, 'matched')}
              >
                {copiedType === 'matched' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                <span>{copiedType === 'matched' ? 'Copied!' : 'Copy Matched'}</span>
              </button>
            )}
          </div>

          {filteredMatched.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              No matched skills found for this filter.
            </p>
          ) : (
            <div className="skill-grid">
              {filteredMatched.map((s, idx) => (
                <span
                  key={idx}
                  className={`skill-tag matched interactive ${selectedSkill?.name === s.name ? 'selected' : ''}`}
                  onClick={() => setSelectedSkill({ ...s, status: 'matched' })}
                  title="Click for skill options"
                >
                  <span className="skill-title">{s.name}</span>
                  <span className="skill-cat">{s.category.replace(/_/g, ' ')}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Missing Skills Section */}
      {(activeTab === 'all' || activeTab === 'missing') && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={17} color="var(--warning)" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fbbf24' }}>
                Missing Job Requirements ({filteredMissing.length})
              </h3>
            </div>

            {filteredMissing.length > 0 && (
              <button
                type="button"
                className="btn-copy-micro"
                onClick={() => copySkillList(filteredMissing, 'missing')}
              >
                {copiedType === 'missing' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                <span>{copiedType === 'missing' ? 'Copied!' : 'Copy Missing'}</span>
              </button>
            )}
          </div>

          {filteredMissing.length === 0 ? (
            <div className="success-banner-box">
              <CheckCircle2 size={16} color="var(--success)" />
              <span>Zero missing skills detected! Profile strongly matches all technical requirements.</span>
            </div>
          ) : (
            <div className="skill-grid">
              {filteredMissing.map((s, idx) => (
                <span
                  key={idx}
                  className={`skill-tag missing interactive ${selectedSkill?.name === s.name ? 'selected' : ''}`}
                  onClick={() => setSelectedSkill({ ...s, status: 'missing' })}
                  title="Click to see bridging advice"
                >
                  <span className="skill-title">{s.name}</span>
                  <span className="skill-cat">{s.category.replace(/_/g, ' ')}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Additional Bonus Skills Section */}
      {(activeTab === 'all' || activeTab === 'additional') && additionalSkills.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <PlusCircle size={17} color="var(--info)" />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38bdf8' }}>
              Candidate Strengths & Bonus Skills ({filteredAdditional.length})
            </h3>
          </div>
          <div className="skill-grid">
            {filteredAdditional.map((s, idx) => (
              <span
                key={idx}
                className="skill-tag additional interactive"
                onClick={() => setSelectedSkill({ ...s, status: 'bonus' })}
              >
                <span className="skill-title">{s.name}</span>
                <span className="skill-cat">{s.category.replace(/_/g, ' ')}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
