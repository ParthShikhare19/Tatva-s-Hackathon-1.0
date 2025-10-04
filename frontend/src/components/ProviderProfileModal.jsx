import { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaStar, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaTools, 
  FaUserCircle,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaHeart,
  FaWhatsapp
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/ProviderProfileModal.css';

const ProviderProfileModal = ({ provider, onClose, onBook, onToggleSave }) => {
  const { t } = useLanguage();
  const [bookingType, setBookingType] = useState('immediate'); // 'immediate' or 'scheduled'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper function to get current date in Indian timezone
  const getCurrentIndianDate = () => {
    const now = new Date();
    const indianTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return indianTime.toISOString().split('T')[0];
  };

  // Helper function to get current time in Indian timezone (12-hour format)
  const getCurrentIndianTime = () => {
    const now = new Date();
    const indianTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const hours = indianTime.getHours();
    const minutes = indianTime.getMinutes();
    
    // Find next available time slot
    const timeSlots = [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
      '05:00 PM', '06:00 PM'
    ];
    
    // Convert current time to minutes since midnight
    const currentMinutes = hours * 60 + minutes;
    
    // Find the next available slot
    for (let slot of timeSlots) {
      const [time, period] = slot.split(' ');
      const [slotHours, slotMinutes] = time.split(':').map(Number);
      let slotHour24 = slotHours;
      
      if (period === 'PM' && slotHours !== 12) {
        slotHour24 += 12;
      } else if (period === 'AM' && slotHours === 12) {
        slotHour24 = 0;
      }
      
      const slotMinutesTotal = slotHour24 * 60 + slotMinutes;
      
      if (slotMinutesTotal > currentMinutes) {
        return slot;
      }
    }
    
    // If no slot found for today, return first slot
    return timeSlots[0];
  };

  // Set default date and time on component mount
  useEffect(() => {
    setSelectedDate(getCurrentIndianDate());
    setSelectedTime(getCurrentIndianTime());
  }, []);

  if (!provider) return null;

  const handleBooking = async () => {
    if (bookingType === 'scheduled' && (!selectedDate || !selectedTime)) {
      alert('Please select both date and time for scheduled booking');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        providerPhone: provider.phone,
        service: provider.service,
        bookingType: bookingType,
        scheduledDate: bookingType === 'scheduled' ? selectedDate : null,
        scheduledTime: bookingType === 'scheduled' ? selectedTime : null,
        description: description
      };
      
      await onBook(bookingData);
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Generate available time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
  ];

  // Get min date (today) for date input
  const today = getCurrentIndianDate();

  const handleWhatsAppClick = () => {
    // Remove any non-digit characters and ensure it has country code
    const phoneNumber = provider.phone.replace(/\D/g, '');
    const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${provider.phone}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Profile Section (Left) */}
          <div className="profile-section">
            <div className="profile-header">
              <div className="profile-avatar">
                <FaUserCircle />
              </div>
              <div className="profile-info">
                <h2>{provider.name}</h2>
                <div className="service-badge">
                  <FaTools /> {provider.service}
                </div>
              </div>
              <button 
                className={`save-btn-modal ${provider.is_saved ? 'saved' : ''}`}
                onClick={() => onToggleSave(provider.phone, provider.is_saved)}
                title={provider.is_saved ? 'Unsave' : 'Save'}
              >
                <FaHeart />
              </button>
            </div>

            <div className="rating-section">
              <FaStar className="star-icon" />
              <span className="rating-value">{provider.rating.toFixed(1)}</span>
              <span className="reviews-text">({provider.reviews_count} reviews)</span>
            </div>

            <div className="about-section">
              <h3><FaUserCircle /> About</h3>
              <p className="about-text">{provider.description || 'No description available'}</p>
            </div>

            <div className="contact-section">
              <h3><FaPhone /> Contact</h3>
              <div className="contact-grid">
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <span>{provider.phone}</span>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>{provider.location || 'Location not specified'}</span>
                </div>
              </div>
              {/* WhatsApp and Phone buttons */}
              <div className="contact-actions">
                <button className="whatsapp-btn" onClick={handleWhatsAppClick}>
                  <FaWhatsapp /> WhatsApp
                </button>
                <button className="phone-btn" onClick={handlePhoneClick}>
                  <FaPhone /> Call
                </button>
              </div>
            </div>
          </div>

          {/* Booking Section (Right) */}
          <div className="booking-section">
            <h3><FaCalendarAlt /> Book Appointment</h3>
            
            <div className="booking-form">
              {/* Booking Type Selection */}
              <div className="form-group">
                <label>Booking Type</label>
                <div className="booking-type-selector">
                  <button
                    className={`booking-type-btn ${bookingType === 'immediate' ? 'active' : ''}`}
                    onClick={() => setBookingType('immediate')}
                  >
                    <FaCheckCircle /> Immediate
                  </button>
                  <button
                    className={`booking-type-btn ${bookingType === 'scheduled' ? 'active' : ''}`}
                    onClick={() => setBookingType('scheduled')}
                  >
                    <FaCalendarAlt /> Schedule
                  </button>
                </div>
              </div>

              {/* Show immediate booking info or scheduled booking form */}
              {bookingType === 'immediate' ? (
                <div className="immediate-booking-info">
                  <FaCheckCircle className="immediate-icon" />
                  <div>
                    <h4>Immediate Booking</h4>
                    <p>Provider will be notified right away</p>
                    <p className="immediate-time">Current time (IST): {new Date().toLocaleString('en-IN', { 
                      timeZone: 'Asia/Kolkata',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="booking-date">
                      <FaCalendarAlt /> Select Date
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="booking-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="booking-time">
                      <FaClock /> Select Time
                    </label>
                    <div className="time-slots-grid">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="booking-description">
                  Description (Optional)
                </label>
                <textarea
                  id="booking-description"
                  placeholder="Describe the service you need..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="booking-textarea"
                  rows="3"
                />
              </div>

              {/* Booking Summary */}
              <div className="booking-summary">
                <FaCheckCircle className="summary-icon" />
                <div>
                  <strong>Booking Summary:</strong>
                  <p>{provider.service} with {provider.name}</p>
                  {bookingType === 'scheduled' && selectedDate && selectedTime && (
                    <p>{selectedDate} at {selectedTime}</p>
                  )}
                  {bookingType === 'immediate' && (
                    <p>Immediate booking</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            className="confirm-book-btn" 
            onClick={handleBooking}
            disabled={loading || (bookingType === 'scheduled' && (!selectedDate || !selectedTime))}
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileModal;
