import React from 'react';

export default function Toasts({ toasts, removeToast }) {
  return (
    <div className="toasts-root">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <div className="toast-message">{t.message}</div>
          <button className="toast-close" onClick={() => removeToast && removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
