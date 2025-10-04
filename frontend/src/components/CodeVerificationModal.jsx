import React, { useState } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/CodeVerificationModal.css';

const CodeVerificationModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  title, 
  description, 
  codeLength = 6,
  type = 'acceptance' // 'acceptance' or 'completion'
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= codeLength) {
      setCode(value);
      setError('');
    }
  };

  const handleVerify = async () => {
    if (code.length !== codeLength) {
      setError(`Please enter the complete ${codeLength}-digit code`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onVerify(code);
      setCode('');
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && code.length === codeLength) {
      handleVerify();
    }
  };

  return (
    <div className="code-modal-overlay" onClick={onClose}>
      <div className="code-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="code-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className={`code-modal-header ${type}`}>
          <FaCheckCircle className="code-modal-icon" />
          <h2>{title}</h2>
        </div>

        <div className="code-modal-body">
          <p className="code-description">{description}</p>

          <div className="code-input-container">
            <label htmlFor="verification-code">Enter {codeLength}-Digit Code</label>
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={codeLength}
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              className={`code-input ${error ? 'error' : ''}`}
              autoFocus
            />
            <div className="code-progress">
              {code.length}/{codeLength} digits entered
            </div>
          </div>

          {error && (
            <div className="code-error">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}

          <div className="code-help">
            <p>💡 <strong>Tip:</strong> Ask the {type === 'acceptance' ? 'provider' : 'provider'} for the code they received.</p>
          </div>
        </div>

        <div className="code-modal-footer">
          <button 
            className="code-btn-cancel" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="code-btn-verify" 
            onClick={handleVerify}
            disabled={loading || code.length !== codeLength}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeVerificationModal;
