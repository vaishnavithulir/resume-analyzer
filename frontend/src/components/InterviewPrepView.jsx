import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Award,
  CheckCircle2,
  Cpu,
  Layers,
  Server,
  Code,
  Cloud,
} from 'lucide-react';

const QUESTIONS_BANK = {
  'Java Backend SDE': [
    {
      id: 1,
      question: 'How does Spring Boot handle dependency injection and what is the difference between @Autowired and Constructor Injection?',
      concept: 'Spring IoC & Clean Architecture',
      difficulty: 'Medium',
      hint: 'Constructor injection promotes immutability, facilitates unit testing with mocks, and prevents circular dependencies.',
      starSolution: {
        situation: 'When building scalable enterprise services in Spring Boot where service dependencies must remain thread-safe.',
        task: 'Ensure clean decoupling of beans without hiding dependencies inside reflection fields.',
        action: 'Defaulted to Constructor Injection across all Spring components, using Lombok @RequiredArgsConstructor or explicit constructors. Avoided field @Autowired.',
        result: 'Achieved 100% testability with Mockito without needing Spring runner context, cutting test suite execution time by 40%.',
      },
    },
    {
      id: 2,
      question: 'Explain the N+1 query problem in Hibernate / Spring Data JPA and how you mitigate it.',
      concept: 'Database Performance & ORM Optimization',
      difficulty: 'Hard',
      hint: 'N+1 occurs when fetching a parent entity executes 1 query, and accessing a lazy child collection executes N additional queries.',
      starSolution: {
        situation: 'In a microservice returning paginated analysis records with associated skill tags.',
        task: 'Eliminate 50+ individual SQL SELECT queries firing during serialization.',
        action: 'Used JPA JOIN FETCH in JPQL queries, Hibernate EntityGraphs, and Spring Data batch-size fetching configurations.',
        result: 'Reduced database roundtrips from 51 queries to 1 single JOIN query, lowering response time from 320ms to 45ms.',
      },
    },
    {
      id: 3,
      question: 'How do you design a thread-safe singleton cache or rate limiter in Java?',
      concept: 'Concurrency & Multi-threading',
      difficulty: 'Hard',
      hint: 'Discuss ConcurrentHashMap, AtomicInteger, Token Bucket algorithm, or Double-Checked Locking with volatile keyword.',
      starSolution: {
        situation: 'Protecting downstream AI REST endpoints from being overwhelmed by concurrent client requests.',
        task: 'Implement a memory-safe rate limiter allowing maximum 10 requests per user per minute.',
        action: 'Utilized ConcurrentHashMap with AtomicLong buckets implementing a sliding window log, or integrated Redis distributed tokens.',
        result: 'Guaranteed thread safety under 2,000 concurrent threads with zero lock contention.',
      },
    },
  ],

  'Full Stack Engineer': [
    {
      id: 4,
      question: 'Explain React 18 Concurrent Rendering and how the Virtual DOM reconciliation algorithm works.',
      concept: 'React Internals & UI Optimization',
      difficulty: 'Medium',
      hint: 'Fiber architecture splits rendering work into chunks and prioritizes urgent user inputs over background updates.',
      starSolution: {
        situation: 'Large candidate data tables causing UI stutter during live search filtering.',
        task: 'Ensure search input remains responsive while heavy filter re-renders occur in the background.',
        action: 'Implemented React 18 useTransition and useDeferredValue hooks to decouple user keystrokes from list updates.',
        result: 'Eliminated frame drops and kept input responsiveness at 60 FPS under 1,000+ filtered elements.',
      },
    },
    {
      id: 5,
      question: 'How do you handle JWT authentication securely between a React frontend and Spring Boot backend?',
      concept: 'Web Security & Stateless Auth',
      difficulty: 'Hard',
      hint: 'Discuss HttpOnly cookies vs localStorage, CSRF protection, and stateless security filter chains.',
      starSolution: {
        situation: 'Designing single sign-on authentication for candidates with 24-hour token expiration.',
        task: 'Prevent XSS token theft and protect against Cross-Site Request Forgery (CSRF).',
        action: 'Configured Spring Security filter chain with JwtAuthenticationFilter and HTTPS transmission.',
        result: 'Passed OWASP compliance security audit with zero vulnerabilities.',
      },
    },
  ],

  'Cloud & DevOps SDE': [
    {
      id: 6,
      question: 'What is the purpose of multi-stage Docker builds and how do you minimize image sizes?',
      concept: 'Docker & Container Optimization',
      difficulty: 'Medium',
      hint: 'Separate the compile/build stage (heavy JDK) from the runtime stage (lightweight JRE Alpine distroless).',
      starSolution: {
        situation: 'Spring Boot Docker images taking up 850MB and causing slow deployment pulls.',
        task: 'Optimize image layers and reduce production container attack surface.',
        action: 'Constructed multi-stage Dockerfile: stage 1 with Maven+JDK for build, stage 2 using Eclipse Temurin 21 JRE Alpine (140MB).',
        result: 'Reduced image footprint by 78% (850MB down to 185MB) and sped up CI/CD pipeline deployments by 3x.',
      },
    },
  ],
};

export default function InterviewPrepView({ onAskCoach }) {
  const [selectedRole, setSelectedRole] = useState('Java Backend SDE');
  const [expandedId, setExpandedId] = useState(null);

  const roles = Object.keys(QUESTIONS_BANK);
  const questions = QUESTIONS_BANK[selectedRole] || [];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="interview-prep-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div className="glass-card interactive-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <div className="studio-icon-badge" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
            <Award size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Technical Interview Question Bank & STAR Simulator
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Targeted interview questions frequently asked by Tier-1 engineering interviewers for your selected role.
            </p>
          </div>
        </div>

        {/* Role Selector Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              className={`cat-pill ${selectedRole === role ? 'active' : ''}`}
              onClick={() => {
                setSelectedRole(role);
                setExpandedId(null);
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {questions.map((q) => {
          const isExpanded = expandedId === q.id;
          return (
            <div key={q.id} className="glass-card interactive-card interview-q-card">
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', gap: '1rem' }}
                onClick={() => toggleExpand(q.id)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="concept-pill">{q.concept}</span>
                    <span className={`diff-pill ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {q.question}
                  </h3>
                </div>

                <button
                  type="button"
                  className="btn-icon"
                  style={{ flexShrink: 0, marginTop: '0.2rem' }}
                  title={isExpanded ? 'Collapse solution' : 'Reveal STAR solution'}
                >
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {/* Collapsed Hint */}
              {!isExpanded && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  💡 Hint: {q.hint}
                </p>
              )}

              {/* Expanded STAR Solution */}
              {isExpanded && (
                <div className="star-solution-drawer">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🌟 Ideal Candidate STAR Response Framework:
                    </span>
                    {onAskCoach && (
                      <button
                        type="button"
                        className="btn-pill-ask-coach"
                        onClick={() => onAskCoach(`Can you do a mock interview with me for this question: "${q.question}"?`)}
                      >
                        <MessageSquare size={13} />
                        <span>Practice with AI Coach</span>
                      </button>
                    )}
                  </div>

                  <div className="star-grid">
                    <div className="star-item">
                      <span className="star-badge">S</span>
                      <div>
                        <strong>Situation:</strong>
                        <p>{q.starSolution.situation}</p>
                      </div>
                    </div>
                    <div className="star-item">
                      <span className="star-badge">T</span>
                      <div>
                        <strong>Task:</strong>
                        <p>{q.starSolution.task}</p>
                      </div>
                    </div>
                    <div className="star-item">
                      <span className="star-badge">A</span>
                      <div>
                        <strong>Action:</strong>
                        <p>{q.starSolution.action}</p>
                      </div>
                    </div>
                    <div className="star-item">
                      <span className="star-badge">R</span>
                      <div>
                        <strong>Result:</strong>
                        <p>{q.starSolution.result}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
