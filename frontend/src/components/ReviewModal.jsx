import React, { useState } from 'react';
import { FaTimes, FaStar, FaCheckCircle } from 'react-icons/fa';
import '../styles/ReviewModal.css';

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  providerName,
  bookingId,
  requiresCode = true
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [completionCode, setCompletionCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (requiresCode && completionCode.length !== 6) {
      setError('Please enter the 6-digit completion code');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        booking_id: bookingId,
        completion_code: completionCode,
        rating: rating,
        comment: comment.trim()
      });

      // Reset form
      setRating(0);
      setComment('');
      setCompletionCode('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCompletionCode(value);
      setError('');
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="review-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="review-modal-header">
          <FaCheckCircle className="review-header-icon" />
          <h2>Rate Your Experience</h2>
          <p>How was your service with {providerName}?</p>
        </div>

        <div className="review-modal-body">
          {requiresCode && (
            <div className="completion-code-section">
              <label htmlFor="completion-code">
                <FaCheckCircle /> Completion Code
              </label>
              <input
                id="completion-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                value={completionCode}
                onChange={handleCodeChange}
                placeholder="000000"
                className="completion-code-input"
              />
              <p className="code-hint">
                Enter the 6-digit code provided by the provider after job completion
              </p>
            </div>
          )}

          <div className="rating-section">
            <label>Your Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            <div className="rating-labels">
              <span className="rating-label">Poor</span>
              <span className="rating-label">Excellent</span>
            </div>
            {rating > 0 && (
              <p className="rating-text">
                {rating === 1 && '😞 Poor'}
                {rating === 2 && '😐 Fair'}
                {rating === 3 && '🙂 Good'}
                {rating === 4 && '😊 Very Good'}
                {rating === 5 && '🤩 Excellent'}
              </p>
            )}
          </div>

          <div className="comment-section">
            <label htmlFor="review-comment">
              Your Review (Optional)
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with others..."
              rows="4"
              maxLength="500"
              className="review-textarea"
            />
            <div className="char-count">
              {comment.length}/500 characters
            </div>
          </div>

          {error && (
            <div className="review-error">
              {error}
            </div>
          )}

          <div className="review-info">
            <p>
              ✨ <strong>Your review helps others</strong> make better decisions and helps providers improve their service.
            </p>
          </div>
        </div>

        <div className="review-modal-footer">
          <button 
            className="review-btn-cancel" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="review-btn-submit" 
            onClick={handleSubmit}
            disabled={loading || rating === 0 || (requiresCode && completionCode.length !== 6)}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
