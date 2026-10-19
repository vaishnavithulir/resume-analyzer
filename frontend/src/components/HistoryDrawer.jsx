import React, { useEffect, useState } from 'react';
import { X, Trash2, Calendar, Award, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { getHistory, getHistoryById, deleteHistory } from '../services/api';

export default function HistoryDrawer({ isOpen, onClose, onLoadRecord }) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(0, 20);
      setHistoryList(data.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this historical analysis?')) return;
    try {
      await deleteHistory(id);
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to delete record: ' + err.message);
    }
  };

  const handleSelect = async (id) => {
    try {
      const fullRecord = await getHistoryById(id);
      onLoadRecord(fullRecord);
      onClose();
    } catch (err) {
      alert('Failed to load historical record: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Analysis History</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Saved in MySQL / JPA Repository
            </p>
          </div>
          <button
            type="button"
            className="btn-remove"
            onClick={onClose}
            title="Close Drawer"
          >
            <X size={24} />
          </button>
        </div>

        {loading && (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading history records...
          </p>
        )}

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.88rem', padding: '1rem' }}>
            {error}
          </p>
        )}

        {!loading && historyList.length === 0 && (
          <div className="empty-state">
            <Calendar className="empty-icon" />
            <p>No previous analysis records found.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
              Run an analysis with the "Save to History" option enabled to store sessions here.
            </p>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {historyList.map((item) => {
            const scoreColor =
              item.overallScore >= 80 ? '#10b981' : item.overallScore >= 65 ? '#06b6d4' : '#f59e0b';
            const dateStr = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent';

            return (
              <div
                key={item.id}
                className="history-item"
                onClick={() => handleSelect(item.id)}
                title="Click to view full report"
              >
                <div className="history-meta">
                  <span className="history-title">{item.candidateName}</span>
                  <span
                    className="history-score-chip"
                    style={{ background: `${scoreColor}20`, color: scoreColor, border: `1px solid ${scoreColor}40` }}
                  >
                    {item.overallScore}% Match
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.65rem' }}>
                  Target: <strong style={{ color: '#cbd5e1' }}>{item.targetJobTitle}</strong>
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={12} color="var(--success)" /> {item.matchedCount} matched
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertTriangle size={12} color="var(--warning)" /> {item.missingCount} missing
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{dateStr}</span>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={(e) => handleDelete(e, item.id)}
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
