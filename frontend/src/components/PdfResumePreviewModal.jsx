import React, { useState } from 'react';
import {
  Printer,
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  Palette,
} from 'lucide-react';

export default function PdfResumePreviewModal({ isOpen, onClose, resumeData, showToast }) {
  const [theme, setTheme] = useState('modern'); // 'modern' | 'classic' | 'emerald'
  const [copied, setCopied] = useState(false);

  if (!isOpen || !resumeData) return null;

  const handlePrint = () => {
    // Add print-specific class to body during print
    document.body.classList.add('printing-resume-document');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-resume-document');
    }, 1000);
  };

  const handleCopyText = () => {
    let plain = `${resumeData.name.toUpperCase()}\n${resumeData.title}\n${resumeData.contact}\n\n`;
    plain += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;
    plain += `TECHNICAL SKILLS\n${resumeData.skills}\n\n`;
    plain += `FEATURED PROJECTS\n`;
    resumeData.projects.forEach((p) => {
      plain += `${p.title} | ${p.tech}\n`;
      if (p.bullet1) plain += `• ${p.bullet1}\n`;
      if (p.bullet2) plain += `• ${p.bullet2}\n`;
      if (p.bullet3) plain += `• ${p.bullet3}\n`;
      plain += `\n`;
    });
    plain += `EDUCATION\n${resumeData.education}\n`;

    navigator.clipboard.writeText(plain);
    setCopied(true);
    showToast?.('ATS plain text copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal-container">
        {/* Modal Toolbar Header */}
        <div className="pdf-modal-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileText size={20} color="var(--accent-primary)" />
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                ATS-Friendly PDF Resume Preview
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Targeted for 1-Page MCA & SDE Placement Standards
              </span>
            </div>
          </div>

          {/* Theme Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Palette size={13} /> Theme:
            </span>
            <button
              type="button"
              className={`theme-selector-pill ${theme === 'modern' ? 'active' : ''}`}
              onClick={() => setTheme('modern')}
            >
              Modern SDE
            </button>
            <button
              type="button"
              className={`theme-selector-pill ${theme === 'classic' ? 'active' : ''}`}
              onClick={() => setTheme('classic')}
            >
              Classic ATS
            </button>
            <button
              type="button"
              className={`theme-selector-pill ${theme === 'emerald' ? 'active' : ''}`}
              onClick={() => setTheme('emerald')}
            >
              Minimal Emerald
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-toolbar"
              onClick={handleCopyText}
              title="Copy plain text"
            >
              {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              className="btn-toolbar primary"
              onClick={handlePrint}
              title="Save as PDF using browser print"
            >
              <Printer size={15} />
              <span>Download / Print PDF</span>
            </button>

            <button
              type="button"
              className="btn-modal-close"
              onClick={onClose}
              title="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Paper Document Preview Area */}
        <div className="pdf-paper-scroll">
          <div className="pdf-paper-hint-bar">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontWeight: 700 }}>
              <CheckCircle2 size={14} /> 1-Page Layout Optimized
            </span>
            <span>
              💡 In the print dialog, select <strong>"Save as PDF"</strong> and ensure <strong>"Background Graphics"</strong> is enabled.
            </span>
          </div>

          {/* The Formatted Resume Document */}
          <div className={`resume-paper-sheet theme-${theme}`} id="resume-printable-document">
            {/* Header */}
            <header className="resume-sheet-header">
              <h1 className="sheet-candidate-name">{resumeData.name}</h1>
              <p className="sheet-candidate-title">{resumeData.title}</p>
              <p className="sheet-candidate-contact">{resumeData.contact}</p>
            </header>

            {/* Summary */}
            {resumeData.summary && (
              <section className="resume-sheet-section">
                <h2 className="sheet-section-title">PROFESSIONAL SUMMARY</h2>
                <div className="sheet-section-divider" />
                <p className="sheet-section-body">{resumeData.summary}</p>
              </section>
            )}

            {/* Skills */}
            {resumeData.skills && (
              <section className="resume-sheet-section">
                <h2 className="sheet-section-title">TECHNICAL SKILLS</h2>
                <div className="sheet-section-divider" />
                <p className="sheet-section-body">
                  <strong>Core Competencies:</strong> {resumeData.skills}
                </p>
              </section>
            )}

            {/* Projects / Experience */}
            {resumeData.projects && resumeData.projects.length > 0 && (
              <section className="resume-sheet-section">
                <h2 className="sheet-section-title">FEATURED TECHNICAL PROJECTS</h2>
                <div className="sheet-section-divider" />
                {resumeData.projects.map((proj, idx) => (
                  <div key={idx} className="sheet-project-item">
                    <div className="sheet-project-header">
                      <span className="sheet-project-name">{proj.title}</span>
                      <span className="sheet-project-tech">{proj.tech}</span>
                    </div>
                    <ul className="sheet-bullet-list">
                      {proj.bullet1 && <li>{proj.bullet1}</li>}
                      {proj.bullet2 && <li>{proj.bullet2}</li>}
                      {proj.bullet3 && <li>{proj.bullet3}</li>}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {/* Education */}
            {resumeData.education && (
              <section className="resume-sheet-section">
                <h2 className="sheet-section-title">EDUCATION & QUALIFICATIONS</h2>
                <div className="sheet-section-divider" />
                <div className="sheet-education-block">
                  {resumeData.education.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className="sheet-education-line">
                      {line}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
