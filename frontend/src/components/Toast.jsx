import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`toast-item ${toast.type || 'info'}`}
            role="alert"
          >
            <div className="toast-icon">
              {isSuccess && <CheckCircle size={18} color="var(--success)" />}
              {isError && <AlertCircle size={18} color="var(--danger)" />}
              {isWarning && <AlertCircle size={18} color="var(--warning)" />}
              {!isSuccess && !isError && !isWarning && <Info size={18} color="var(--accent-primary)" />}
            </div>
            <div className="toast-content">
              {toast.title && <h5 className="toast-title">{toast.title}</h5>}
              <p className="toast-message">{toast.message}</p>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => onDismiss(toast.id)}
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
