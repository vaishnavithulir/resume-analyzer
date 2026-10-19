import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle, Eye, EyeOff, Sparkles, FileEdit, Trash2, Clock, Hash } from 'lucide-react';
import { extractResumeText } from '../services/api';

const SAMPLE_MCA_RESUME = `PRIYA SHARMA
MCA Graduate (2026) | Full Stack & Software Development Engineer
Email: priya.sharma@example.com | GitHub: github.com/priyasharma | LinkedIn: linkedin.com/in/priyasharma

PROFESSIONAL SUMMARY
Motivated MCA Software Engineering graduate with strong technical foundations in Java 21, Spring Boot, React 18, and MySQL. Proven track record of developing full-stack web applications, architecting RESTful microservices, and implementing automated testing. Eager to contribute to scalable cloud-native systems.

TECHNICAL SKILLS
• Programming Languages: Java, JavaScript (ES6+), SQL, HTML5, CSS3
• Frameworks & Libraries: Spring Boot, Spring Data JPA, React, Node.js, Express
• Databases & Storage: MySQL, PostgreSQL, H2
• DevOps & Tools: Git, GitHub, Postman, Vite, Maven
• Methodologies & Soft Skills: Object-Oriented Programming (OOP), Data Structures & Algorithms, Agile/Scrum, Problem Solving, Team Collaboration

PROJECTS
AI Resume Analyzer & Job Match Engine | Java 21, Spring Boot, React, MySQL
• Architected full-stack career advisor processing resumes via Apache Tika and calculating transparent match scores using 60/20/20 rubric.
• Built high-performance React 18 dashboard with dynamic glassmorphism UI, real-time score gauge, and interactive AI chatbot assistant.
• Designed JPA persistence layer with dual H2/MySQL profiles supporting encrypted JWT authentication and historical report analytics.

E-Commerce Microservices Platform | Spring Boot, React, PostgreSQL
• Developed distributed RESTful services for product inventory, user auth, and cart checkout handling 500+ simulated concurrent requests.
• Implemented robust exception handling, DTO validation, and Swagger OpenAPI documentation.

EDUCATION
Master of Computer Applications (MCA) — 2024 - 2026 | CGPA: 8.8/10
Bachelor of Computer Applications (BCA) — 2021 - 2024 | CGPA: 8.6/10`;

export default function FileUpload({ file, setFile, resumeText, setResumeText, setError, onCandidateDetected }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'paste'
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);
  const fileInputRef = useRef(null);

  const wordCount = resumeText ? resumeText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = resumeText ? resumeText.length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit. Please upload a smaller resume.');
      return;
    }

    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.docx') && !name.endsWith('.doc')) {
      setError('Unsupported format. Please upload a PDF or Word document (.pdf, .docx).');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsExtracting(true);

    try {
      const data = await extractResumeText(selectedFile);
      setResumeText(data.extractedText);
      setFileDetails(data);

      if (onCandidateDetected) {
        // Clean candidate name from filename
        let detected = selectedFile.name
          .replace(/\.[^/.]+$/, '')
          .replace(/\s*(?:cv|resume|\(\d+\)|updated|latest)\s*/gi, ' ')
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Check first line of extracted text
        const firstLine = (data.extractedText || '').trim().split('\n')[0]?.trim();
        if (
          firstLine &&
          /^[A-Z][a-zA-Z\s.]{2,35}$/.test(firstLine) &&
          !/(resume|curriculum|profile|developer|engineer|summary)/i.test(firstLine)
        ) {
          detected = firstLine;
        }

        if (detected && detected.length >= 2) {
          onCandidateDetected(detected);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to extract text from file.');
      setFile(null);
      setFileDetails(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onRemoveFile = () => {
    setFile(null);
    setResumeText('');
    setFileDetails(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadSampleResume = () => {
    setFile(null);
    setResumeText(SAMPLE_MCA_RESUME);
    setFileDetails({
      originalFileName: 'Sample_MCA_Priya_Sharma.txt',
      fileSize: SAMPLE_MCA_RESUME.length,
      wordCount: SAMPLE_MCA_RESUME.trim().split(/\s+/).length,
      characterCount: SAMPLE_MCA_RESUME.length,
    });
    if (onCandidateDetected) {
      onCandidateDetected('Priya Sharma');
    }
    setError(null);
  };

  return (
    <div className="glass-card interactive-card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h2 className="card-title">
            <FileText size={20} color="var(--accent-primary)" />
            <span>1. Resume Input</span>
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            Upload your document or paste/edit resume text directly
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-pill-sample"
            onClick={loadSampleResume}
            title="Load realistic MCA SWE portfolio resume"
          >
            <Sparkles size={13} />
            <span>Load Sample Resume</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="segmented-control" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={`segment-btn ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          <UploadCloud size={15} />
          <span>Upload File (PDF/DOCX)</span>
        </button>
        <button
          type="button"
          className={`segment-btn ${mode === 'paste' ? 'active' : ''}`}
          onClick={() => setMode('paste')}
        >
          <FileEdit size={15} />
          <span>Direct Text / Paste</span>
          {wordCount > 0 && <span className="segment-badge">{wordCount}w</span>}
        </button>
      </div>

      {mode === 'upload' ? (
        !file ? (
          <div
            className={`dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            id="resume-dropzone"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFile(e.target.files?.[0])}
              accept=".pdf,.docx,.doc"
              style={{ display: 'none' }}
            />
            <div className="dropzone-icon">
              <UploadCloud size={32} />
            </div>
            <h3 className="dropzone-title">Click to upload or drag & drop</h3>
            <p className="dropzone-subtitle">
              Supports PDF, DOCX, DOC up to 5MB. Apache Tika extracts and normalizes text automatically.
            </p>
          </div>
        ) : (
          <div className="file-active-container">
            <div className="file-chip">
              <div className="file-info">
                <CheckCircle size={24} color="var(--success)" />
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">
                    {(file.size / 1024).toFixed(1)} KB • {fileDetails?.wordCount || wordCount} words • ~{readingTime} min read
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-icon"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPreview ? 'Hide Text' : 'Inspect Text'}</span>
                </button>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={onRemoveFile}
                  title="Remove file"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {isExtracting && (
              <div className="extracting-bar">
                <div className="extracting-pulse" />
                <span>Extracting text and validating file structure...</span>
              </div>
            )}

            {showPreview && resumeText && (
              <div style={{ marginTop: '1rem', animation: 'fadeIn 0.2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Extracted Resume Text (Editable):</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {charCount} chars • {wordCount} words
                  </span>
                </div>
                <textarea
                  className="form-textarea"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={8}
                />
              </div>
            )}
          </div>
        )
      ) : (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="form-group" style={{ marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Paste or Edit Candidate Resume:</label>
              {wordCount > 0 && (
                <button
                  type="button"
                  onClick={() => setResumeText('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
            </div>
            <textarea
              className="form-textarea"
              placeholder="Paste plain text resume content here (Skills, Experience, Education, Projects)..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={9}
              id="resume-text-input"
            />
          </div>

          <div className="text-stats-bar">
            <span className="stat-pill"><Hash size={12} /> {wordCount} words</span>
            <span className="stat-pill"><FileText size={12} /> {charCount} characters</span>
            <span className="stat-pill"><Clock size={12} /> ~{readingTime} min read</span>
            {wordCount >= 50 && (
              <span className="stat-pill success"><CheckCircle size={12} /> ATS Text Ready</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
