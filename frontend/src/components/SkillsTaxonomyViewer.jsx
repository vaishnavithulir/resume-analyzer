import React, { useState } from 'react';
import {
  Layers,
  Search,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Tag,
  CheckCircle2,
  Code,
  Server,
  Database,
  Cloud,
  Cpu,
  Users,
} from 'lucide-react';

const SKILLS_DATA = [
  // LANGUAGES
  { name: 'Java', category: 'LANGUAGES', demand: 'Top Tier (SWE 2027)', aliases: ['java 21', 'java 17', 'core java'], icon: Server },
  { name: 'Python', category: 'LANGUAGES', demand: 'Top Tier (SWE 2027)', aliases: ['python3', 'py'], icon: Code },
  { name: 'JavaScript', category: 'LANGUAGES', demand: 'Top Tier (SWE 2027)', aliases: ['js', 'es6', 'vanilla js'], icon: Code },
  { name: 'TypeScript', category: 'LANGUAGES', demand: 'High Growth', aliases: ['ts'], icon: Code },
  { name: 'SQL', category: 'LANGUAGES', demand: 'Essential Foundation', aliases: ['structured query', 't-sql', 'pl/sql'], icon: Database },
  { name: 'C++', category: 'LANGUAGES', demand: 'Core Foundation', aliases: ['cpp', 'c plus plus'], icon: Code },
  { name: 'C#', category: 'LANGUAGES', demand: 'Core Foundation', aliases: ['csharp', '.net'], icon: Code },
  { name: 'Go', category: 'LANGUAGES', demand: 'High Growth (Cloud)', aliases: ['golang'], icon: Server },
  { name: 'HTML', category: 'LANGUAGES', demand: 'Essential Foundation', aliases: ['html5'], icon: Code },
  { name: 'CSS', category: 'LANGUAGES', demand: 'Essential Foundation', aliases: ['css3'], icon: Code },

  // FRAMEWORKS
  { name: 'Spring Boot', category: 'FRAMEWORKS', demand: 'Top Tier (Enterprise)', aliases: ['springboot', 'spring framework'], icon: Server },
  { name: 'Spring Security', category: 'FRAMEWORKS', demand: 'High Demand', aliases: ['spring-security', 'oauth2', 'jwt'], icon: Server },
  { name: 'Spring Data JPA', category: 'FRAMEWORKS', demand: 'High Demand', aliases: ['spring data', 'hibernate'], icon: Database },
  { name: 'React', category: 'FRAMEWORKS', demand: 'Top Tier (Frontend)', aliases: ['reactjs', 'react.js'], icon: Code },
  { name: 'Node.js', category: 'FRAMEWORKS', demand: 'Top Tier (Full Stack)', aliases: ['nodejs', 'node'], icon: Server },
  { name: 'Express.js', category: 'FRAMEWORKS', demand: 'High Demand', aliases: ['express', 'expressjs'], icon: Server },
  { name: 'Next.js', category: 'FRAMEWORKS', demand: 'High Growth', aliases: ['nextjs', 'ssr'], icon: Code },
  { name: 'Django', category: 'FRAMEWORKS', demand: 'Core Foundation', aliases: ['django framework'], icon: Server },
  { name: 'FastAPI', category: 'FRAMEWORKS', demand: 'High Growth (AI/ML)', aliases: ['fast api'], icon: Cpu },

  // DATABASES
  { name: 'MySQL', category: 'DATABASES', demand: 'Top Tier (Relational)', aliases: ['my-sql'], icon: Database },
  { name: 'PostgreSQL', category: 'DATABASES', demand: 'Top Tier (Enterprise)', aliases: ['postgres', 'postgre sql'], icon: Database },
  { name: 'MongoDB', category: 'DATABASES', demand: 'High Demand (NoSQL)', aliases: ['mongo', 'document db'], icon: Database },
  { name: 'Redis', category: 'DATABASES', demand: 'High Growth (Caching)', aliases: ['redis cache', 'in-memory'], icon: Database },

  // CLOUD & DEVOPS
  { name: 'AWS', category: 'CLOUD_DEVOPS', demand: 'Top Tier (Cloud)', aliases: ['amazon web services', 's3', 'ec2'], icon: Cloud },
  { name: 'Docker', category: 'CLOUD_DEVOPS', demand: 'Top Tier (Containers)', aliases: ['containerization', 'containers'], icon: Cloud },
  { name: 'Kubernetes', category: 'CLOUD_DEVOPS', demand: 'Top Tier (Orchestration)', aliases: ['k8s'], icon: Cloud },
  { name: 'CI/CD', category: 'CLOUD_DEVOPS', demand: 'Essential (DevOps)', aliases: ['continuous integration', 'github actions', 'cicd'], icon: Cloud },
  { name: 'Git', category: 'CLOUD_DEVOPS', demand: 'Mandatory', aliases: ['github', 'gitlab', 'version control'], icon: Code },
  { name: 'Linux', category: 'CLOUD_DEVOPS', demand: 'Mandatory', aliases: ['unix', 'bash', 'shell'], icon: Server },

  // ENGINEERING CONCEPTS
  { name: 'REST APIs', category: 'CONCEPTS', demand: 'Mandatory', aliases: ['restful', 'rest api', 'web services'], icon: Server },
  { name: 'Microservices', category: 'CONCEPTS', demand: 'Top Tier (Architecture)', aliases: ['distributed systems'], icon: Layers },
  { name: 'System Design', category: 'CONCEPTS', demand: 'High Demand (SDE)', aliases: ['hld', 'lld', 'scalability'], icon: Layers },
  { name: 'OOP', category: 'CONCEPTS', demand: 'Mandatory', aliases: ['object-oriented', 'polymorphism', 'inheritance'], icon: Code },
  { name: 'Data Structures & Algorithms', category: 'CONCEPTS', demand: 'Mandatory (Interviews)', aliases: ['dsa', 'leetcode'], icon: Cpu },
  { name: 'Unit Testing', category: 'CONCEPTS', demand: 'Essential', aliases: ['junit', 'mockito', 'jest'], icon: CheckCircle2 },

  // SOFT SKILLS
  { name: 'Agile/Scrum', category: 'SOFT_SKILLS', demand: 'Mandatory', aliases: ['sprints', 'jira', 'scrum methodology'], icon: Users },
  { name: 'Problem Solving', category: 'SOFT_SKILLS', demand: 'Mandatory', aliases: ['analytical thinking', 'debugging'], icon: Users },
  { name: 'Team Collaboration', category: 'SOFT_SKILLS', demand: 'Mandatory', aliases: ['cross-functional', 'communication'], icon: Users },
];

export default function SkillsTaxonomyViewer({ onAskCoach, onAddSkillToResume }) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'All Skills' },
    { id: 'LANGUAGES', label: 'Languages' },
    { id: 'FRAMEWORK', label: 'Frameworks' },
    { id: 'DATABASES', label: 'Databases' },
    { id: 'CLOUD_DEVOPS', label: 'Cloud & DevOps' },
    { id: 'CONCEPTS', label: 'Engineering Architecture' },
    { id: 'SOFT_SKILLS', label: 'Soft Skills' },
  ];

  const filteredSkills = SKILLS_DATA.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      s.aliases.some((a) => a.toLowerCase().includes(search.toLowerCase().trim()));
    const matchesCat = selectedCat === 'ALL' || s.category.includes(selectedCat);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="taxonomy-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Hero Header */}
      <div className="glass-card interactive-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <div className="studio-icon-badge" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
            <Layers size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              SWE Skills Universe & Market Taxonomy
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Explore the curated 67+ software engineering skills taxonomy evaluated by our match engine, complete with alias mapping and placement demand tiers.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="skills-toolbar" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <div className="skill-search-box">
            <Search size={15} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search by skill name or alias (e.g. 'k8s', 'springboot', 'docker')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="skill-search-input"
            />
          </div>

          <div className="skill-cat-scroll">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cat-pill ${selectedCat === c.id ? 'active' : ''}`}
                onClick={() => setSelectedCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="taxonomy-cards-grid">
        {filteredSkills.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="taxonomy-card glass-card interactive-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="taxonomy-icon-box">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {s.name}
                    </h4>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                      {s.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <span className="demand-badge">
                  {s.demand}
                </span>
              </div>

              {s.aliases.length > 0 && (
                <div style={{ margin: '0.75rem 0' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                    RECOGNIZED ALIASES:
                  </span>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {s.aliases.map((al, aIdx) => (
                      <span key={aIdx} className="alias-chip">
                        {al}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                {onAskCoach && (
                  <button
                    type="button"
                    className="btn-bullet-action"
                    onClick={() => onAskCoach(`What are the most frequent technical interview questions asked about ${s.name}?`)}
                    title="Interview questions for this skill"
                  >
                    <MessageSquare size={12} /> Prep
                  </button>
                )}
                {onAddSkillToResume && (
                  <button
                    type="button"
                    className="btn-bullet-action copy"
                    onClick={() => onAddSkillToResume(s.name)}
                    title="Add skill to active resume"
                  >
                    + Add to Resume
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
