import { useState, useEffect } from 'react';
import { FaMobileAlt, FaTimes, FaRedo } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/OtpModal.css';

const OtpModal = ({ phone, onVerify, onClose, onResend }) => {
  const { t } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      document.getElementById(`otp-input-${nextIndex}`)?.focus();
    } else if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    }
    setError('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onVerify(otpCode);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-input-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    setOtp(['', '', '', '', '', '']);
    
    try {
      await onResend();
      setResendTimer(60);
      setCanResend(false);
      document.getElementById('otp-input-0')?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-modal-overlay" onClick={onClose}>
      <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="otp-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="otp-modal-header">
          <FaMobileAlt className="otp-icon" />
          <h2>{t('verifyOtp') || 'Verify OTP'}</h2>
          <p className="otp-subtitle">
            {t('otpSentTo') || 'We sent a verification code to'}
          </p>
          <p className="otp-phone">+91 {phone}</p>
        </div>

        <form className="otp-form" onSubmit={handleSubmit}>
          {error && <div className="otp-error">{error}</div>}

          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-input"
                autoFocus={index === 0}
                disabled={loading}
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="otp-verify-button" 
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? (t('verifying') || 'Verifying...') : (t('verify') || 'Verify')}
          </button>

          <div className="otp-resend">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="otp-resend-button"
                disabled={loading}
              >
                <FaRedo /> {t('resendOtp') || 'Resend OTP'}
              </button>
            ) : (
              <p className="otp-timer">
                {t('resendIn') || 'Resend in'} {resendTimer}s
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpModal;
