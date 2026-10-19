import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Bot, User, Trash2, ArrowDown, ChevronDown, Check, Copy, PlusCircle } from 'lucide-react';
import { sendChatMessage } from '../services/api';

const QUICK_PROMPTS = [
  { label: '✍️ Quantified Bullet Enhancer', prompt: 'Can you transform my project bullet points into quantified, high-impact accomplishments?' },
  { label: '🎯 Bridge Missing Skills', prompt: 'How can I naturally add my missing skills to my resume without keyword stuffing?' },
  { label: '🌟 Tailored Summary', prompt: 'Draft a high-impact 2-line professional summary tailored for this job title.' },
  { label: '📈 Boost Match Score', prompt: 'What specific changes should I make to increase my score to 80+?' },
  { label: '💡 Technical Interview Prep', prompt: 'What technical interview questions should I expect based on this job description?' },
];

export default function ChatAssistant({ context, triggerPrompt, onPromptConsumed, onInsertBullet }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "👋 **Hi! I'm your ResuVantage Career Coach.**\n\nI can help you transform weak draft sentences into **quantified, recruiter-grade accomplishments**, naturally incorporate missing keywords, tailor your professional summary, and prep for technical interviews.\n\n*Click any quick prompt below or paste an experience bullet point to get started!*",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const inputRef = useRef(null);

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const handleInsertFromMessage = (text) => {
    if (!onInsertBullet) return;
    // Extract bullet points from the response if present
    const lines = text.split('\n');
    const bulletLines = lines.filter((l) => /^[-*•]\s+/.test(l.trim()));
    if (bulletLines.length > 0) {
      bulletLines.forEach((b) => {
        onInsertBullet(b.trim().replace(/^[-*•]\s+/, ''));
      });
    } else {
      // Clean and insert the text
      const clean = text.replace(/^#+\s+/gm, '').trim();
      onInsertBullet(clean);
    }
  };

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(scrollToBottom, 50);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  // Handle external triggers from skill tags, simulator, or bullet rewrites
  useEffect(() => {
    if (triggerPrompt) {
      setIsOpen(true);
      handleSendMessage(triggerPrompt);
      if (onPromptConsumed) {
        onPromptConsumed();
      }
    }
  }, [triggerPrompt]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg = { role: 'user', content: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChatMessage({
        message: query,
        conversationHistory,
        context,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.reply, source: response.advisorySource },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Unable to complete request:** ${err.message || 'Please check your connection and try again.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "🔄 **Chat reset.** How can I assist you with refining your resume or interview prep today?",
      },
    ]);
  };

  // Helper to format basic markdown (bold, bullets, headers) safely
  const formatMarkdown = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('### ')) {
        return <h4 key={idx} style={{ margin: '0.6rem 0 0.3rem', fontSize: '0.98rem', fontWeight: 800, color: '#c7d2fe' }}>{trimmed.substring(4)}</h4>;
      }
      if (trimmed.startsWith('#### ')) {
        return <h5 key={idx} style={{ margin: '0.5rem 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#93c5fd' }}>{trimmed.substring(5)}</h5>;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            style={{
              borderLeft: '3px solid var(--accent-primary)',
              paddingLeft: '0.75rem',
              margin: '0.5rem 0',
              color: '#e2e8f0',
              fontStyle: 'italic',
              background: 'rgba(99, 102, 241, 0.08)',
              padding: '0.4rem 0.6rem',
              borderRadius: '0 6px 6px 0',
            }}
          >
            {renderBoldText(trimmed.substring(2))}
          </blockquote>
        );
      }

      // Bullet points
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.4rem', margin: '0.25rem 0 0.25rem 0.4rem' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>•</span>
            <span>{renderBoldText(trimmed.substring(2))}</span>
          </div>
        );
      }

      // Numbered items
      if (/^\d+\.\s/.test(trimmed)) {
        const num = trimmed.match(/^(\d+\.)\s/)[1];
        const content = trimmed.replace(/^\d+\.\s/, '');
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.4rem', margin: '0.25rem 0 0.25rem 0.4rem' }}>
            <span style={{ color: 'var(--accent-secondary)', fontWeight: 700, minWidth: '1.2rem' }}>{num}</span>
            <span>{renderBoldText(content)}</span>
          </div>
        );
      }

      if (!trimmed) {
        return <div key={idx} style={{ height: '0.4rem' }} />;
      }

      return <p key={idx} style={{ margin: '0.25rem 0' }}>{renderBoldText(line)}</p>;
    });
  };

  const renderBoldText = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#ffffff', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} style={{ color: '#cbd5e1' }}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '0.1rem 0.35rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85em',
              color: '#a5b4fc',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="chat-assistant-container">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          className="chat-fab-button"
          onClick={() => setIsOpen(true)}
          title="Open AI Resume Enhancement Assistant"
          id="btn-open-chatbot"
        >
          <div className="chat-fab-badge">AI</div>
          <Sparkles size={24} />
          <span className="chat-fab-text">Enhance Resume</span>
        </button>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div className="chat-header-avatar">
                <Bot size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>ResuVantage Coach</h3>
                  <span className="live-dot" title="Active & Ready" />
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  High-Impact Rewriter & Placement Mentor
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <button
                className="btn-chat-icon"
                onClick={handleClearChat}
                title="Reset Conversation"
                id="btn-clear-chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                className="btn-chat-icon"
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
                id="btn-close-chatbot"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          {context && (context.matchedSkills?.length > 0 || context.missingSkills?.length > 0) ? (
            <div className="chat-context-banner">
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>🎯 Active Context:</span>{' '}
              <span>{context.candidateName || 'Candidate'}</span> •{' '}
              <span>Score {context.overallScore || 0}/100</span>
              {context.missingSkills?.length > 0 && (
                <span style={{ color: '#fbbf24', marginLeft: '0.3rem' }}>
                  ({context.missingSkills.length} skill gaps)
                </span>
              )}
            </div>
          ) : (
            <div className="chat-context-banner" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
              <span>💡 Run a resume analysis to activate personalized context</span>
            </div>
          )}

          {/* Quick Prompt Chips */}
          <div className="chat-quick-chips">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                className="quick-chip"
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={loading}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="chat-messages-scroll" ref={chatScrollRef}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message-row ${msg.role === 'user' ? 'msg-user' : 'msg-assistant'}`}
              >
                <div className="chat-bubble">
                  {formatMarkdown(msg.content)}
                  {msg.role === 'assistant' && (
                    <div className="chat-bubble-footer">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn-chat-bubble-action"
                          onClick={() => handleCopyMessage(msg.content, idx)}
                          title="Copy message to clipboard"
                        >
                          {copiedMsgIdx === idx ? <Check size={11} color="var(--success)" /> : <Copy size={11} />}
                          <span>{copiedMsgIdx === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                        {onInsertBullet && (
                          <button
                            type="button"
                            className="btn-chat-bubble-action insert"
                            onClick={() => handleInsertFromMessage(msg.content)}
                            title="Insert bullet into your active resume"
                          >
                            <PlusCircle size={11} />
                            <span>Insert to Resume</span>
                          </button>
                        )}
                      </div>
                      {msg.source && (
                        <span className="chat-bubble-source">
                          {msg.source === 'GEMINI_LLM' ? 'Gemini AI' : 'Rule Engine'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message-row msg-assistant">
                <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem' }}>
                  <Loader2 size={16} className="spinner" style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Enhancing resume bullet points & formulating advice...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="chat-footer">
            <textarea
              ref={inputRef}
              className="chat-input"
              rows={2}
              placeholder="Ask to rewrite a bullet, add missing skills, or prep for interview..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              id="input-chatbot-query"
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              title="Send (Enter)"
              id="btn-chatbot-send"
            >
              {loading ? <Loader2 size={18} className="spinner" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
