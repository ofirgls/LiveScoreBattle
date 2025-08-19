import React from 'react';

const ErrorModal = ({ message, onClose }) => {
  return (
    <div className="error-modal-overlay">
      <div className="error-modal">
        <div className="error-modal-header">
          <h3>⚠️ שגיאה</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="error-modal-content">
          <p>{message}</p>
        </div>
        <div className="error-modal-footer">
          <button onClick={onClose} className="error-ok-btn">
            הבנתי
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
