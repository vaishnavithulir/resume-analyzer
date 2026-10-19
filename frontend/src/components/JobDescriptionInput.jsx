import React, { useState } from 'react';
import { Briefcase, Sparkles, Trash2, CheckCircle2, ChevronRight, Hash, Code, Server, Cloud, Cpu, Layers } from 'lucide-react';

const SAMPLE_TEMPLATES = [
  {
    id: 'java-backend',
    category: 'Backend',
    icon: Server,
    title: 'Java Backend SDE',
    tags: ['Java 21', 'Spring Boot', 'MySQL', 'REST', 'Docker'],
    description: `We are looking for an Associate Software Engineer with strong proficiency in Java 17+, Spring Boot, MySQL, and REST APIs. Experience with Docker, microservices architecture, and unit testing using JUnit is preferred. Candidates must have solid Data Structures & Algorithms knowledge, good communication skills, and agile team collaboration experience.`,
  },
  {
    id: 'fullstack',
    category: 'Full Stack',
    icon: Layers,
    title: 'Full Stack Engineer',
    tags: ['React', 'JavaScript', 'Spring Boot', 'Node.js', 'PostgreSQL'],
    description: `Seeking a Full Stack Developer proficient in React, JavaScript, HTML/CSS, and Spring Boot or Node.js. Must know relational databases like MySQL or PostgreSQL, Git version control, and containerization with Docker. Experience with AWS cloud deployment, CI/CD pipelines, and problem-solving skills is highly desirable.`,
  },
  {
    id: 'cloud-devops',
    category: 'DevOps',
    icon: Cloud,
    title: 'Cloud & DevOps SDE',
    tags: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD'],
    description: `Hiring a Cloud Infrastructure Engineer skilled in AWS, Docker, Kubernetes, Linux shell scripting, and CI/CD automation with GitHub Actions. Knowledge of Python, Terraform, system design fundamentals, and monitoring tools like Prometheus is a big plus.`,
  },
  {
    id: 'ai-ml',
    category: 'AI / ML',
    icon: Cpu,
    title: 'AI / GenAI Developer',
    tags: ['Python', 'LLMs', 'Gemini', 'FastAPI', 'Vector DB'],
    description: `Looking for an AI Application Engineer skilled in Python, generative AI APIs (Google Gemini, OpenAI), LangChain, and FastAPI. Experience with vector databases, RAG architectures, model fine-tuning, and REST APIs is strongly desired.`,
  },
  {
    id: 'frontend',
    category: 'Frontend',
    icon: Code,
    title: 'Frontend Web Engineer',
    tags: ['React', 'TypeScript', 'Tailwind', 'Next.js', 'Vite'],
    description: `Seeking a Frontend Engineer with deep experience in React 18+, TypeScript, modern CSS, state management, and responsive web design. Familiarity with RESTful APIs, web accessibility (a11y), client-side performance tuning, and unit testing with Jest or Vitest.`,
  },
];

export default function JobDescriptionInput({ jobDescription, setJobDescription }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const wordCount = jobDescription ? jobDescription.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = jobDescription ? jobDescription.length : 0;

  const categories = ['All', 'Backend', 'Full Stack', 'DevOps', 'AI / ML', 'Frontend'];

  const filteredTemplates = selectedCategory === 'All'
    ? SAMPLE_TEMPLATES
    : SAMPLE_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="glass-card interactive-card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Briefcase size={20} color="var(--accent-secondary)" />
            <span>2. Target Job Description</span>
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Paste the job posting or click any industry template below
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {charCount > 0 && (
            <button
              type="button"
              className="btn-clear-text"
              onClick={() => setJobDescription('')}
              title="Clear text"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <textarea
          className="form-textarea"
          placeholder="Paste the target job description, required qualifications, core tech stack, and responsibilities here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={7}
          id="job-description-textarea"
        />
      </div>

      <div className="text-stats-bar" style={{ marginBottom: '1rem' }}>
        <span className="stat-pill"><Hash size={12} /> {wordCount} words</span>
        <span className="stat-pill"><Briefcase size={12} /> {charCount} characters</span>
        {wordCount >= 30 && (
          <span className="stat-pill success"><CheckCircle2 size={12} /> Ready for Scoring</span>
        )}
      </div>

      {/* Interactive Role Templates Section */}
      <div className="role-templates-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 700 }}>
              Quick-Fill SWE Role Templates:
            </span>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-micro-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="template-cards-grid">
          {filteredTemplates.map((tmpl) => {
            const Icon = tmpl.icon;
            const isSelected = jobDescription === tmpl.description;
            return (
              <div
                key={tmpl.id}
                className={`template-role-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setJobDescription(tmpl.description)}
                role="button"
                tabIndex={0}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="template-icon-wrap">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 className="template-role-title">{tmpl.title}</h4>
                    <span className="template-role-cat">{tmpl.category}</span>
                  </div>
                </div>

                <div className="template-tag-pills">
                  {tmpl.tags.map((t, idx) => (
                    <span key={idx} className="micro-tag">{t}</span>
                  ))}
                </div>

                <div className="template-card-footer">
                  <span>{isSelected ? '✓ Loaded' : 'Click to Load'}</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
