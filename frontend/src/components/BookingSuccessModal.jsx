import React from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationCircle,
  FaCopy,
  FaTimes
} from 'react-icons/fa';
import '../styles/BookingSuccessModal.css';

const BookingSuccessModal = ({ 
  isOpen, 
  onClose, 
  bookingData,
  bookingCode,
  bookingType = 'scheduled'
}) => {
  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookingCode);
    alert('Booking code copied to clipboard!');
  };

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="success-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="success-modal-header">
          <div className="success-icon-wrapper">
            <FaCheckCircle className="success-icon" />
          </div>
          <h2>Booking Confirmed!</h2>
          <p>Your booking request has been sent successfully</p>
        </div>

        <div className="success-modal-body">
          {/* Booking Code */}
          <div className="booking-code-card">
            <div className="code-label">
              <FaExclamationCircle /> Your Booking Code
            </div>
            <div className="booking-code-display">
              {bookingCode}
            </div>
            <button className="copy-code-btn" onClick={copyToClipboard}>
              <FaCopy /> Copy Code
            </button>
            <p className="code-note">
              Please save this code for your reference
            </p>
          </div>

          {/* Booking Details */}
          <div className="booking-details-card">
            <h3>Booking Details</h3>
            <div className="detail-row">
              <span className="detail-label">Provider:</span>
              <span className="detail-value">{bookingData.providerName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Service:</span>
              <span className="detail-value">{bookingData.service}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Type:</span>
              <span className={`booking-type-badge ${bookingType}`}>
                {bookingType === 'immediate' ? '⚡ Immediate' : '📅 Scheduled'}
              </span>
            </div>
            {bookingType === 'scheduled' && (
              <>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{bookingData.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{bookingData.time}</span>
                </div>
              </>
            )}
          </div>

          {/* Next Steps */}
          <div className="next-steps-card">
            <h3>What Happens Next?</h3>
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <strong>Provider Review</strong>
                <p>The provider will review your booking request</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <strong>Acceptance Code</strong>
                <p>If accepted, you'll receive a 6-digit code to verify the provider</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <strong>Service Completion</strong>
                <p>After service, you'll get a code to leave a verified review</p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="important-notice">
            <FaExclamationCircle className="notice-icon" />
            <div>
              <strong>Important:</strong> You can track your booking status in the dashboard. 
              The provider will be notified {bookingType === 'immediate' ? 'immediately' : 'about your scheduled booking'}.
            </div>
          </div>
        </div>

        <div className="success-modal-footer">
          <button className="goto-dashboard-btn" onClick={onClose}>
            <FaCheckCircle /> Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessModal;
