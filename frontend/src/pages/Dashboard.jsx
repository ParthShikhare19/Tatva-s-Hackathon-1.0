import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import api from "../services/api";
import ProviderProfileModal from "../components/ProviderProfileModal";
import {
  FaUserCircle,
  FaSearch,
  FaTools,
  FaCalendarAlt,
  FaHeart,
  FaStar,
  FaMoneyBillWave,
  FaClipboardList,
  FaChartLine,
  FaPlus,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaCheck,
  FaTimes,
  FaUser,
  FaEdit,
  FaSave,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaBriefcase,
  FaBookmark,
  FaRegBookmark,
  FaLock,
  FaShieldAlt,
  FaKey,
  FaHistory,
  FaClipboardCheck,
} from "react-icons/fa";
import ApiService from "../services/api";
import "../styles/Dashboard.css";

function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState("");
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);

  useEffect(() => {
    fetchUserData();
    generateNewJobCode();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      generateNewJobCode();
    }
  }, [timeLeft]);

  const generateNewJobCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setJobCode(code);
    setTimeLeft(900);
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const userData = await api.getCurrentUser();
      setUser(userData);
      
      if (userData.role === "provider") {
        await fetchProviderData(userData.id);
      }
      
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setError("Failed to load dashboard data");
      
      if (error.message.includes("Invalid") || error.message.includes("token")) {
        localStorage.removeItem('authToken');
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderData = async (userId) => {
    try {
      // Fetch dashboard stats
      const stats = await api.request(`/providers/${userId}/dashboard-stats`);
      setProviderProfile(stats);

      // Fetch pending requests
      const pending = await api.request(`/providers/${userId}/pending-requests`);
      setPendingRequests(pending);

      // Fetch accepted jobs
      const accepted = await api.request(`/providers/${userId}/accepted-jobs`);
      setAcceptedJobs(accepted);

      // Fetch completed jobs
      const completed = await api.request(`/providers/${userId}/completed-jobs`);
      setCompletedJobs(completed);
      
    } catch (error) {
      console.error("Failed to fetch provider data:", error);
      setError("Failed to load provider data: " + error.message);
      // Set empty arrays to avoid errors
      setPendingRequests([]);
      setAcceptedJobs([]);
      setCompletedJobs([]);
    }
  };

  const handleAcceptJob = async (requestId) => {
    try {
      await api.request(`/providers/jobs/${requestId}/accept`, {
        method: 'POST'
      });
      
      // Refresh data after accepting
      await fetchProviderData(user.id);
      setError("");
      
    } catch (error) {
      console.error("Failed to accept job:", error);
      setError("Failed to accept job request: " + error.message);
    }
  };

  const handleRejectJob = async (requestId) => {
    try {
      await api.request(`/providers/jobs/${requestId}/reject`, {
        method: 'POST'
      });
      
      // Refresh data after rejecting
      await fetchProviderData(user.id);
      setError("");
      
    } catch (error) {
      console.error("Failed to reject job:", error);
      setError("Failed to reject job request: " + error.message);
    }
  };

  const handleCompleteJob = async (jobId) => {
    try {
      await api.request(`/providers/jobs/${jobId}/complete`, {
        method: 'POST'
      });
      
      // Refresh data after completing
      await fetchProviderData(user.id);
      setError("");
      
    } catch (error) {
      console.error("Failed to complete job:", error);
      setError("Failed to complete job: " + error.message);
    }
  };

  const handleLogout = () => {
    // Show confirmation dialog in selected language
    const confirmed = window.confirm(t("common.confirmLogout"));

    if (confirmed) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userType");
      localStorage.removeItem("userName");
      navigate("/");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header - Only for Customer */}
      {userType === "customer" && (
        <header className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <FaUserCircle 
                className="user-avatar clickable-avatar" 
                onClick={() => setShowCustomerProfile(true)}
              />
              <div>
                <h2>{t("welcomeBack")}</h2>
                <p className="user-name">{userName}</p>
              </div>
            </div>
            <div className="header-actions">
              <LanguageSwitcher />
              <button className="notification-btn">
                <FaBell />
                <span className="notification-count">{pendingRequests.length}</span>
              </button>
              <button className="settings-btn">
                <FaCog />
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </header>
      )}

      {userType === "customer" ? (
        <CustomerDashboard 
          t={t} 
          userName={userName} 
          showProfile={showCustomerProfile}
          setShowProfile={setShowCustomerProfile}
        />
      ) : (
        <ProviderDashboard
          t={t}
          userName={userName}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
}

// Customer Dashboard Component
function CustomerDashboard({ t, userName, showProfile, setShowProfile }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState({ 
    active_bookings: 0, 
    booking_history: 0, 
    saved_providers: 0,
    pending_bookings: 0,
    accepted_bookings: 0,
    completed_bookings: 0,
    cancelled_bookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showActiveBookings, setShowActiveBookings] = useState(false);
  const [showBookingHistory, setShowBookingHistory] = useState(false);
  const [showSavedProviders, setShowSavedProviders] = useState(false);
  const [activeBookingsList, setActiveBookingsList] = useState([]);
  const [bookingHistoryList, setBookingHistoryList] = useState([]);
  const [savedProvidersList, setSavedProvidersList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  
  // Acceptance code validation modal states
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  const [acceptanceCodeInput, setAcceptanceCodeInput] = useState('');
  const [acceptanceValidationError, setAcceptanceValidationError] = useState('');
  
  // Completion and Review modal states (combined)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [completionCodeInput, setCompletionCodeInput] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  
  const [savedProviders, setSavedProviders] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userName || "",
    phone: "",
    email: "",
  });
  const providersPerPage = 6;

  const categories = ["All", "Plumbing", "Electrical", "Carpentry", "Cleaning", "Painting", "Gardening"];
  const locations = ["All", "Mumbai", "Delhi", "Pune", "Bangalore"];
  const ratings = [
    { label: "All Ratings", value: "all" },
    { label: "4.5+ Stars", value: "4.5" },
    { label: "4.0+ Stars", value: "4.0" },
    { label: "3.5+ Stars", value: "3.5" },
  ];

  // Fetch customer profile on mount
  useEffect(() => {
    console.log("showProfile changed:", showProfile);
    if (showProfile) {
      setIsEditingProfile(false); // Reset to view mode when opening
      fetchCustomerProfile();
    }
  }, [showProfile]);

  const fetchCustomerProfile = async () => {
    try {
      const profile = await api.getCustomerProfile();
      setProfileData({
        name: profile.name || "",
        phone: profile.phone_number || "",
        email: profile.email_id || "",
      });
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      // If profile doesn't exist, keep default empty values
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updateData = {
        name: profileData.name,
        phone_number: profileData.phone,
        email_id: profileData.email,
      };

      await api.updateCustomerProfile(updateData);
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch stats and providers on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if authenticated before making requests
        if (!ApiService.isAuthenticated()) {
          setError('Please log in to view providers');
          setLoading(false);
          return;
        }
        
        const [statsData, providersData] = await Promise.all([
          ApiService.getCustomerStats(),
          ApiService.getProviders({ limit: 50 })
        ]);
        setStats(statsData);
        setProviders(providersData || []);
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch data';
        setError(errorMessage);
        console.error('Error fetching dashboard data:', err);
        
        // If authentication error, redirect to login
        if (errorMessage.includes('401') || errorMessage.includes('authenticated') || errorMessage.includes('token')) {
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/signin';
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Refetch providers when filters change
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const filters = {};
        if (searchQuery) filters.search = searchQuery;
        if (selectedCategory !== 'all') filters.service = selectedCategory;
        if (selectedLocation !== 'all') filters.location = selectedLocation;
        if (selectedRating !== 'all') filters.min_rating = parseFloat(selectedRating);
        
        const data = await ApiService.getProviders(filters);
        setProviders(data);
      } catch (err) {
        console.error('Error fetching providers:', err);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchProviders();
    }, 300); // Debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedLocation, selectedRating]);

  // Pagination - now works directly on providers from backend
  const filteredProviders = providers; // Backend already filtered
  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const currentProviders = filteredProviders.slice(
    indexOfFirstProvider,
    indexOfLastProvider
  );
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === "All" ? "all" : category);
    setCurrentPage(1);
  };

  const handleSaveProvider = async (providerPhone, isSaved) => {
    try {
      if (isSaved) {
        await ApiService.unsaveProvider(providerPhone);
      } else {
        await ApiService.saveProvider(providerPhone);
      }
      // Update local state
      setProviders(providers.map(p => 
        p.phone === providerPhone ? { ...p, is_saved: !isSaved } : p
      ));
      // Update selected provider if modal is open
      if (selectedProvider && selectedProvider.phone === providerPhone) {
        setSelectedProvider({ ...selectedProvider, is_saved: !isSaved });
      }
      // Refresh stats to update saved providers count
      try {
        const updatedStats = await ApiService.getCustomerStats();
        setStats(updatedStats);
      } catch (err) {
        console.error('Error refreshing stats:', err);
      }
    } catch (err) {
      console.error('Error toggling saved provider:', err);
      alert(err.message || 'Failed to update saved providers');
    }
  };

  const handleOpenProviderModal = (provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
  };

  const handleCloseProviderModal = () => {
    setShowProviderModal(false);
    setTimeout(() => setSelectedProvider(null), 300);
  };

  const handleBookProvider = async (bookingData) => {
    try {
      const response = await ApiService.createBooking({
        provider_phone: bookingData.providerPhone,
        service: bookingData.service,
        booking_type: bookingData.bookingType,
        scheduled_date: bookingData.scheduledDate,
        scheduled_time: bookingData.scheduledTime,
        description: bookingData.description
      });
      
      // Show success message with booking code
      const bookingType = bookingData.bookingType === 'immediate' ? 'Immediate' : 'Scheduled';
      const scheduleInfo = bookingData.bookingType === 'scheduled' 
        ? `Date: ${bookingData.scheduledDate}\nTime: ${bookingData.scheduledTime}\n` 
        : '';
      
      alert(
        `✅ Booking Confirmed!\n\n` +
        `Type: ${bookingType}\n` +
        `Provider: ${selectedProvider.name}\n` +
        `Service: ${bookingData.service}\n` +
        scheduleInfo +
        `The provider has been notified. Please save this code for reference.`
      );
      
      // Refresh stats to update active bookings count
      try {
        const updatedStats = await ApiService.getCustomerStats();
        setStats(updatedStats);
      } catch (err) {
        console.error('Error refreshing stats:', err);
      }
      
      handleCloseProviderModal();
    } catch (err) {
      console.error('Error creating booking:', err);
      throw err;
    }
  };

  // Show error message if there's an authentication or fetch error
  if (error) {
    return (
      <div className="dashboard-content">
        <div className="error-message" style={{ 
          padding: '20px', 
          backgroundColor: '#fee', 
          color: '#c33', 
          borderRadius: '8px', 
          margin: '20px',
          textAlign: 'center'
        }}>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            {error.includes('authenticated') || error.includes('log in') ? 
              'Redirecting to login...' : 
              'Please check your connection and try again.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Stats Cards - Now on Top - Clickable - 2x3 Grid */}
      <div className="stats-grid stats-grid-extended">
        <div 
          className="stat-card stat-clickable" 
          onClick={async () => {
            try {
              const bookings = await ApiService.getCustomerBookings('pending');
              setActiveBookingsList(bookings);
              setShowActiveBookings(true);
            } catch (err) {
              console.error('Error fetching pending bookings:', err);
              alert('Failed to load pending bookings');
            }
          }}
          title="Click to view pending bookings"
        >
          <FaClock className="stat-icon pending-icon" />
          <div className="stat-info">
            <h4>Pending Bookings</h4>
            <p className="stat-number">{stats.pending_bookings}</p>
          </div>
        </div>
        
        <div 
          className="stat-card stat-clickable" 
          onClick={async () => {
            try {
              const bookings = await ApiService.getCustomerBookings('accepted');
              setActiveBookingsList(bookings);
              setShowActiveBookings(true);
            } catch (err) {
              console.error('Error fetching accepted bookings:', err);
              alert('Failed to load accepted bookings');
            }
          }}
          title="Click to view accepted bookings"
        >
          <FaCheckCircle className="stat-icon accepted-icon" />
          <div className="stat-info">
            <h4>Accepted Bookings</h4>
            <p className="stat-number">{stats.accepted_bookings}</p>
          </div>
        </div>
        
        <div 
          className="stat-card stat-clickable"
          onClick={async () => {
            try {
              const bookings = await ApiService.getCustomerBookings('completed');
              setActiveBookingsList(bookings);
              setShowActiveBookings(true);
            } catch (err) {
              console.error('Error fetching completed bookings:', err);
              alert('Failed to load completed bookings');
            }
          }}
          title="Click to view completed bookings"
        >
          <FaCheck className="stat-icon completed-icon" />
          <div className="stat-info">
            <h4>Completed Bookings</h4>
            <p className="stat-number">{stats.completed_bookings}</p>
          </div>
        </div>
        
        <div 
          className="stat-card stat-clickable"
          onClick={async () => {
            try {
              const bookings = await ApiService.getCustomerBookings();
              setBookingHistoryList(bookings);
              setShowBookingHistory(true);
            } catch (err) {
              console.error('Error fetching booking history:', err);
              alert('Failed to load booking history');
            }
          }}
          title="Click to view booking history"
        >
          <FaCalendarAlt className="stat-icon history-icon" />
          <div className="stat-info">
            <h4>{t("dashboard.customer.bookingHistory")}</h4>
            <p className="stat-number">{stats.booking_history}</p>
          </div>
        </div>
        
        <div 
          className="stat-card stat-clickable"
          onClick={async () => {
            try {
              const saved = providers.filter(p => p.is_saved);
              setSavedProvidersList(saved);
              setShowSavedProviders(true);
            } catch (err) {
              console.error('Error fetching saved providers:', err);
              alert('Failed to load saved providers');
            }
          }}
          title="Click to view saved providers"
        >
          <FaBookmark className="stat-icon saved-icon" />
          <div className="stat-info">
            <h4>{t("dashboard.customer.savedProviders")}</h4>
            <p className="stat-number">{stats.saved_providers}</p>
          </div>
        </div>
        
        <div 
          className="stat-card stat-clickable"
          onClick={async () => {
            try {
              const bookings = await ApiService.getCustomerBookings('cancelled');
              setActiveBookingsList(bookings);
              setShowActiveBookings(true);
            } catch (err) {
              console.error('Error fetching cancelled bookings:', err);
              alert('Failed to load cancelled bookings');
            }
          }}
          title="Click to view cancelled bookings"
        >
          <FaTimes className="stat-icon cancelled-icon" />
          <div className="stat-info">
            <h4>Cancelled Bookings</h4>
            <p className="stat-number">{stats.cancelled_bookings}</p>
          </div>
        </div>
      </div>

      {/* Combined Search and Filters Section */}
      <section className="search-filter-section">
        <div className="search-container">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaTools /> Filters
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="category-pills">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-pill ${
                selectedCategory === (category === "All" ? "all" : category)
                  ? "active"
                  : ""
              }`}
              onClick={() => handleCategorySelect(category)}
            >
              <FaChartLine /> Overview
            </button>
            <button 
              className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              <FaTools /> Jobs
            </button>
            <button 
              className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser /> Profile
            </button>
          ))}
        </div>

        {/* Advanced Filters - Collapsible */}
        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label>Rating</label>
              <select
                value={selectedRating}
                onChange={(e) => {
                  setSelectedRating(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {ratings.map((rating) => (
                  <option key={rating.value} value={rating.value}>
                    {rating.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {locations.map((location) => (
                  <option
                    key={location}
                    value={location === "All" ? "all" : location}
                  >
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedRating("all");
                setSelectedLocation("all");
                setSearchQuery("");
                setCurrentPage(1);
              }}
            >
              <FaHistory /> History
            </button>
          </div>
        )}
      </section>

      {/* Service Providers Section */}
      <section className="providers-section">
        <div className="section-header">
          <h3>{t("dashboard.customer.nearbyProviders")}</h3>
        </div>

        {currentProviders.length > 0 ? (
          <>
            <div className="providers-grid">
              {currentProviders.map((provider) => (
                <div key={provider.phone} className="provider-card">
                  <div className="provider-header">
                    <FaUserCircle className="provider-avatar" />
                    <div className="provider-info">
                      <h4 className="provider-name">{provider.name}</h4>
                      <div className="provider-rating">
                        <FaStar className="star-icon" />
                        <span className="rating-value">{provider.rating.toFixed(1)}</span>
                        <span className="reviews-count">({provider.reviews_count} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="provider-body">
                    <div className="service-badge">
                      <FaTools /> {provider.service}
                    </div>
                    <p className="provider-description">{provider.description || 'No description available'}</p>
                    <div className="provider-location">
                      <FaMapMarkerAlt className="location-icon" />
                      <span>{provider.location || 'Location not specified'}</span>
                    </div>
                  </div>
                  <div className="provider-actions">
                    <button 
                      className="book-btn"
                      onClick={() => handleOpenProviderModal(provider)}
                    >
                      Book Now
                    </button>
                    <button 
                      className={`save-btn ${provider.is_saved ? 'saved' : ''}`}
                      onClick={() => handleSaveProvider(provider.phone, provider.is_saved)}
                      title={provider.is_saved ? 'Unsave' : 'Save'}
                    >
                      <FaBookmark />
                    </button>
                  </div>
                </div>

                <div className="stat-card rating">
                  <FaStar className="stat-icon" />
                  <div className="stat-info">
                    <h3>{providerProfile?.average_rating || 0.0}</h3>
                    <p>Average Rating</p>
                  </div>
                </div>

                <div className="stat-card active">
                  <FaClipboardList className="stat-icon" />
                  <div className="stat-info">
                    <h3>{providerProfile?.active_jobs || 0}</h3>
                    <p>Active Jobs</p>
                  </div>
                </div>
              </div>

              <div className="job-code-section">
                <div className="code-card">
                  <h3>Your One-Time Service Code</h3>
                  <div className="job-code">{jobCode}</div>
                  <p className="code-timer">
                    <FaClock /> Expires in: {formatTime(timeLeft)}
                  </p>
                  <small>Share this code with customers to verify service completion</small>
                </div>
              </div>

              <div className="quick-stats">
                <div className="quick-stat">
                  <span className="stat-number">{pendingRequests.length}</span>
                  <span className="stat-label">Pending Requests</span>
                </div>
                <div className="quick-stat">
                  <span className="stat-number">{acceptedJobs.length}</span>
                  <span className="stat-label">In Progress</span>
                </div>
                <div className="quick-stat">
                  <span className="stat-number">{completedJobs.length}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
            </div>
          )}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className="pagination-numbers">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      className={`pagination-number ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <FaMapMarkerAlt className="empty-icon" />
            <p>No service providers found</p>
            <p className="empty-subtitle">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </section>

      {/* Provider Profile Modal */}
      {showProviderModal && selectedProvider && (
        <ProviderProfileModal
          provider={selectedProvider}
          onClose={handleCloseProviderModal}
          onBook={handleBookProvider}
          onToggleSave={handleSaveProvider}
        />
      )}

      {/* Active Bookings Modal */}
      {showActiveBookings && (
        <div className="modal-overlay" onClick={() => setShowActiveBookings(false)}>
          <div className="modal-container large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaCalendarAlt /> Active Bookings</h2>
              <button className="close-btn" onClick={() => setShowActiveBookings(false)}>×</button>
            </div>
            <div className="modal-body">
              {activeBookingsList.length > 0 ? (
                <div className="bookings-list">
                  {activeBookingsList.map((booking) => (
                    <div key={booking.id} className="booking-item clickable" onClick={() => {
                      setSelectedBooking(booking);
                      setShowBookingDetails(true);
                    }}>
                      <div className="booking-header">
                        <h4>{booking.provider_name}</h4>
                        <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                      </div>
                      <p><strong>Service:</strong> {booking.service}</p>
                      <p><strong>Location:</strong> {booking.location || 'N/A'}</p>
                      
                      {/* Acceptance Notification with Verification */}
                      {booking.status === 'accepted' && !booking.acceptance_verified && (
                        <div className="acceptance-notification">
                          <p className="notification-text">
                            <FaCheckCircle /> Provider accepted your booking!
                            <br />
                            <small>Click below to verify the provider's identity</small>
                          </p>
                          <button 
                            className="verify-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(booking);
                              setShowAcceptanceModal(true);
                              setAcceptanceCodeInput('');
                              setAcceptanceValidationError('');
                            }}
                          >
                            <FaLock /> Verify Provider
                          </button>
                        </div>
                      )}

                      {/* Show verification success and completion button */}
                      {booking.status === 'accepted' && booking.acceptance_verified && (
                        <div className="verified-notification">
                          <p className="notification-text">
                            <FaCheckCircle /> Provider verified!
                            <br />
                            <small>Work in progress</small>
                          </p>
                          <button 
                            className="complete-btn"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const response = await ApiService.completeBooking(booking.id);
                                // Show review modal immediately with completion code
                                setSelectedBooking(booking);
                                setCompletionCodeInput(response.completion_code || '');
                                setRating(5);
                                setReviewComment('');
                                setReviewError('');
                                setShowReviewModal(true);
                                // Refresh bookings
                                const updatedBookings = await ApiService.getCustomerBookings();
                                setActiveBookingsList(updatedBookings.filter(b => b.status === 'pending' || b.status === 'accepted'));
                              } catch (err) {
                                alert(err.message || 'Failed to mark as finished');
                              }
                            }}
                          >
                            <FaCheck /> Mark as Finished
                          </button>
                        </div>
                      )}

                      {/* Rating Option after Completion */}
                      {booking.status === 'completed' && (
                        <button 
                          className="rate-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                            setShowReviewModal(true);
                            setCompletionCodeInput('');
                            setRating(5);
                            setReviewComment('');
                            setReviewError('');
                          }}
                        >
                          ⭐ Rate Provider
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No active bookings found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking History Modal */}
      {showBookingHistory && (
        <div className="modal-overlay" onClick={() => setShowBookingHistory(false)}>
          <div className="modal-container large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaHistory /> Booking History</h2>
              <button className="close-btn" onClick={() => setShowBookingHistory(false)}>×</button>
            </div>
            <div className="modal-body">
              {bookingHistoryList.length > 0 ? (
                <div className="bookings-list">
                  {bookingHistoryList.map((booking) => (
                    <div key={booking.id} className="booking-item clickable" onClick={() => {
                      setSelectedBooking(booking);
                      setShowBookingDetails(true);
                    }}>
                      <div className="booking-header">
                        <h4>{booking.provider_name}</h4>
                        <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                      </div>
                      <p><strong>Service:</strong> {booking.service}</p>
                      <p><strong>Date:</strong> {new Date(booking.created_at).toLocaleDateString()}</p>
                      <p><strong>Location:</strong> {booking.location || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No booking history found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved Providers Modal */}
      {showSavedProviders && (
        <div className="modal-overlay" onClick={() => setShowSavedProviders(false)}>
          <div className="modal-container large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaBookmark /> Saved Providers</h2>
              <button className="close-btn" onClick={() => setShowSavedProviders(false)}>×</button>
            </div>
            <div className="modal-body">
              {savedProvidersList.length > 0 ? (
                <div className="providers-grid">
                  {savedProvidersList.map((provider) => (
                    <div 
                      key={provider.phone || provider.id} 
                      className="provider-card clickable" 
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowProviderModal(true);
                        setShowSavedProviders(false);
                      }}
                    >
                      <h4>{provider.name}</h4>
                      <p key="service"><FaTools /> {provider.service}</p>
                      <p key="location"><FaMapMarkerAlt /> {provider.location_name}</p>
                      <p key="rating"><FaStar /> {provider.rating ? provider.rating.toFixed(1) : 'N/A'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No saved providers found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div
            className="modal-content profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                <FaUserCircle style={{ marginRight: "0.5rem" }} />
                {t("common.profile")}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowProfile(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body profile-body">
              {!isEditingProfile ? (
                /* View Mode - READ ONLY */
                <div className="profile-view">
                  <div className="profile-avatar-section">
                    <FaUserCircle className="profile-avatar-large" />
                    <h2>{profileData.name}</h2>
                  </div>

                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <FaEnvelope className="profile-icon" />
                      <div>
                        <label>Email</label>
                        <p>{profileData.email || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="profile-info-item">
                      <FaPhone className="profile-icon" />
                      <div>
                        <label>Phone</label>
                        <p>{profileData.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button
                      className="edit-profile-btn"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <FaEdit /> Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit Mode - EDITABLE */
                <div className="profile-edit">
                  <div className="profile-avatar-section">
                    <FaUserCircle className="profile-avatar-large" />
                    <h2>Edit Profile</h2>
                  </div>

                  <div className="profile-form">
                    <div className="form-group">
                      <label>
                        <FaUser className="form-icon" /> Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleProfileChange("name", e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <FaPhone className="form-icon" /> Phone
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <FaEnvelope className="form-icon" /> Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange("email", e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button
                      className="cancel-edit-btn"
                      onClick={() => {
                        setIsEditingProfile(false);
                        fetchCustomerProfile();
                      }}
                    >
                      <FaTimes /> Cancel
                    </button>
                    <button
                      className="save-profile-btn"
                      onClick={handleSaveProfile}
                    >
                      <FaSave /> Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowBookingDetails(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaClipboardList /> Booking Details</h2>
              <button className="close-btn" onClick={() => setShowBookingDetails(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="booking-details">
                <div className="detail-row">
                  <span className="label">Provider:</span>
                  <span className="value">{selectedBooking.provider_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Service:</span>
                  <span className="value">{selectedBooking.service}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${selectedBooking.status}`}>{selectedBooking.status}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">{selectedBooking.location || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Description:</span>
                  <span className="value">{selectedBooking.description || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Created:</span>
                  <span className="value">{new Date(selectedBooking.created_at).toLocaleString()}</span>
                </div>
                {selectedBooking.booking_type && (
                  <div className="detail-row">
                    <span className="label">Type:</span>
                    <span className="value">{selectedBooking.booking_type}</span>
                  </div>
                )}
                {selectedBooking.scheduled_date && (
                  <div className="detail-row">
                    <span className="label">Scheduled:</span>
                    <span className="value">{selectedBooking.scheduled_date} at {selectedBooking.scheduled_time}</span>
                  </div>
                )}
                {selectedBooking.acceptance_code && (
                  <div className="detail-row highlight">
                    <span className="label"><FaKey /> Acceptance Code:</span>
                    <span className="value code">{selectedBooking.acceptance_code}</span>
                  </div>
                )}
                {selectedBooking.completion_code && (
                  <div className="detail-row highlight">
                    <span className="label"><FaCheckCircle /> Completion Code:</span>
                    <span className="value code">{selectedBooking.completion_code}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acceptance Code Verification Modal */}
      {showAcceptanceModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowAcceptanceModal(false)}>
          <div className="modal-container verification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaLock /> Verify Provider Identity</h2>
              <button className="close-btn" onClick={() => setShowAcceptanceModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="verification-content">
                <p className="instruction-text">
                  The provider has accepted your booking for <strong>{selectedBooking.service}</strong>.
                </p>
                <p className="instruction-text">
                  Ask the provider to show you their <strong>6-digit acceptance code</strong> and enter it below to verify their identity.
                </p>
                
                <div className="code-input-section">
                  <label htmlFor="acceptance-code">Enter Acceptance Code:</label>
                  <input
                    id="acceptance-code"
                    type="text"
                    className="code-input"
                    placeholder="000000"
                    maxLength="6"
                    value={acceptanceCodeInput}
                    onChange={(e) => {
                      setAcceptanceCodeInput(e.target.value.replace(/\D/g, ''));
                      setAcceptanceValidationError('');
                    }}
                  />
                  {acceptanceValidationError && (
                    <p className="error-message">{acceptanceValidationError}</p>
                  )}
                </div>

                <div className="modal-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setShowAcceptanceModal(false);
                      setAcceptanceCodeInput('');
                      setAcceptanceValidationError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="verify-btn-primary"
                    onClick={() => {
                      if (acceptanceCodeInput.length !== 6) {
                        setAcceptanceValidationError('Please enter a 6-digit code');
                        return;
                      }
                      if (acceptanceCodeInput === selectedBooking.acceptance_code) {
                        // Mark as verified (in real app, this would be an API call)
                        setShowAcceptanceModal(false);
                        setAcceptanceCodeInput('');
                        // Show success notification
                        const updatedBookings = activeBookingsList.map(b => 
                          b.id === selectedBooking.id ? {...b, acceptance_verified: true} : b
                        );
                        setActiveBookingsList(updatedBookings);
                      } else {
                        setAcceptanceValidationError('❌ Invalid code. Please check with the provider.');
                      }
                    }}
                  >
                    <FaCheck /> Verify Code
                  </button>
                </div>

                <div className="security-note">
                  <p><FaShieldAlt /> Security Note: Never share your codes with anyone except the service provider when they arrive.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal with Completion Code - MANDATORY */}
      {showReviewModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => {/* Prevent closing - review is mandatory */}}>
          <div className="modal-container review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaStar /> Rate Your Experience (Required)</h2>
              <div className="mandatory-badge"><FaCheckCircle /> Mandatory to Complete Booking</div>
            </div>
            <div className="modal-body">
              <div className="review-content">
                <p className="review-subtitle">Service by <strong>{selectedBooking.provider_name}</strong></p>
                
                <div className="completion-info-box">
                  <h4><FaClipboardCheck /> Completion Code</h4>
                  <p className="completion-code-display">{completionCodeInput || 'Loading...'}</p>
                  <p className="info-text">This code was automatically generated when you marked the work as finished.</p>
                </div>
                
                {/* Rating Section */}
                <div className="rating-section">
                  <label>Your Rating: <span className="required">*</span></label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= rating ? 'filled' : ''}`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="rating-text">{rating} out of 5 stars</p>
                </div>

                <div className="comment-section">
                  <label htmlFor="review-comment">Your Review (Optional):</label>
                  <textarea
                    id="review-comment"
                    className="review-textarea"
                    placeholder="Share your experience with this provider..."
                    rows="4"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                {reviewError && (
                  <p className="error-message">{reviewError}</p>
                )}

                <div className="modal-actions">
                  <button 
                    className="submit-review-btn primary-action"
                    onClick={async () => {
                      if (!completionCodeInput || completionCodeInput.length !== 6) {
                        setReviewError('Completion code is required');
                        return;
                      }
                      
                      try {
                        await ApiService.createReview({
                          booking_id: selectedBooking.id,
                          completion_code: completionCodeInput,
                          rating: rating,
                          comment: reviewComment || null
                        });
                        
                        alert('<FaCheck /> Review submitted successfully! Booking is now complete.');
                        setShowReviewModal(false);
                        setCompletionCodeInput('');
                        setRating(5);
                        setReviewComment('');
                        setReviewError('');
                        
                        // Refresh bookings and stats
                        const [updatedBookings, updatedStats] = await Promise.all([
                          ApiService.getCustomerBookings(),
                          ApiService.getCustomerStats()
                        ]);
                        setActiveBookingsList(updatedBookings.filter(b => b.status === 'pending' || b.status === 'accepted'));
                        setStats(updatedStats);
                      } catch (err) {
                        setReviewError(err.message || 'Failed to submit review');
                      }
                    }}
                  >
                    <FaCheck /> Submit Review & Complete Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
      
// Provider Dashboard Component
function ProviderDashboard({ t, userName, handleLogout }) {
  const [showAcceptedJobs, setShowAcceptedJobs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Profile data
  const [profileData, setProfileData] = useState({
    name: userName || "Provider Name",
    email: "provider@example.com",
    phone: "+91 9876543210",
    address: "Mumbai, Maharashtra",
    specialization: "Plumbing, Electrical",
    experience: "5 years",
    bio: "Professional service provider with expertise in multiple domains.",
  });

  // Temporary state for editing
  const [editedProfile, setEditedProfile] = useState({ ...profileData });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProviderProfile();
        setProfileData({
          name: data.name || userName || "Provider Name",
          email: data.email_id || "provider@example.com",
          phone: data.phone_number || "+91 9876543210",
          address: data.location_name || "Mumbai, Maharashtra",
          specialization: "Plumbing, Electrical", // Not in backend yet
          experience: data.years_of_experience
            ? `${data.years_of_experience} years`
            : "5 years",
          bio:
            data.bio ||
            "Professional service provider with expertise in multiple domains.",
        });
        setLoadingProfile(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoadingProfile(false);
        // If profile doesn't exist, we'll use default values
      }
    };

    fetchProfile();
  }, [userName]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [stats, setStats] = useState({
    avg_rating: 0,
    total_reviews: 0,
    customers_served: 0,
    active_bookings: 0,
    pending_requests: 0,
    accepted_jobs: 0,
    reviews: [],
    served_customers: []
  });
  const [workRequests, setWorkRequests] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states for reviews and customers
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showCustomersModal, setShowCustomersModal] = useState(false);

  // Fetch provider data
  const fetchProviderData = async () => {
    try {
      setError(null);
      const [statsData, pendingData, acceptedData] = await Promise.all([
        ApiService.getProviderStats(),
        ApiService.getProviderPendingRequests(),
        ApiService.getProviderAcceptedJobs()
      ]);
      
      setStats(statsData);
      setWorkRequests(pendingData || []);
      setAcceptedJobs(acceptedData || []);
      console.log('✅ Provider data refreshed:', {
        pending: pendingData?.length || 0,
        accepted: acceptedData?.length || 0
      });
    } catch (err) {
      console.error('Error fetching provider data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchProviderData();
  }, []);

  // Auto-refresh every 10 seconds for real-time updates
  useEffect(() => {
    console.log('🔄 Auto-refresh enabled: Checking for new bookings every 10 seconds');
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing provider data...');
      fetchProviderData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAcceptRequest = async (request) => {
    try {
      const response = await ApiService.acceptBooking(request.id);
      alert(`✅ Booking accepted!\n\nYour acceptance code: ${response.acceptance_code || 'N/A'}\n\nShare this code with the customer when you meet them.`);
      // Refresh data to show updated lists
      await fetchProviderData();
    } catch (err) {
      console.error('Error accepting request:', err);
      alert(err.message || 'Failed to accept booking');
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!confirm('Are you sure you want to reject this booking?')) return;
    
    try {
      await ApiService.rejectBooking(requestId);
      alert('✅ Booking rejected');
      // Refresh data to remove rejected booking
      await fetchProviderData();
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert(err.message || 'Failed to reject booking');
    }
  };

  const handleCancelJob = async (jobId) => {
    if (!confirm('Are you sure you want to cancel this job?')) return;
    
    try {
      await ApiService.cancelJob(jobId);
      alert('✅ Job cancelled');
      // Refresh data to remove cancelled job
      await fetchProviderData();
    } catch (err) {
      console.error('Error cancelling job:', err);
      alert(err.message || 'Failed to cancel job');
    }
  };

  // Completion is now handled by customer, not provider

  const handleViewAcceptedJobs = () => {
    setShowAcceptedJobs(true);
  };

                <div className="job-section">
                  <h3><FaTools /> Active Jobs ({acceptedJobs.length})</h3>
                  <div className="job-list">
                    {acceptedJobs.length > 0 ? (
                      acceptedJobs.map((job) => (
                        <div key={job.id} className="job-card accepted">
                          <div className="job-header">
                            <h4>{job.title}</h4>
                            <span className="job-price">₹{job.price}</span>
                          </div>
                          <p className="job-description">{job.description}</p>
                          <div className="job-details">
                            <div className="job-location">
                              <FaMapMarkerAlt /> {job.location}
                            </div>
                            <div className="job-customer">
                              <FaUser /> {job.customer_name}
                            </div>
                            <div className="job-phone">
                              <FaPhone /> {job.customer_phone}
                            </div>
                            <div className="job-time">
                              <FaClock /> Accepted: {formatDate(job.accepted_at)}
                            </div>
                          </div>
                          <div className="job-actions">
                            <button 
                              className="complete-btn"
                              onClick={() => handleCompleteJob(job.id)}
                            >
                              <FaCheckCircle /> Mark Complete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-data">
                        <FaTools size={48} />
                        <p>No active jobs</p>
                        <small>Jobs you accept will appear here</small>
                      </div>
                    )}
                  </div>
                </div>

  const handleShowProfile = () => {
    setShowProfile(true);
    setIsEditingProfile(false);
    setEditedProfile({ ...profileData });
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setIsEditingProfile(false);
    setEditedProfile({ ...profileData });
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditedProfile({ ...profileData });
  };

  const handleProfileChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Extract numeric years from experience string (e.g., "5 years" -> 5)
      const experienceYears = parseInt(editedProfile.experience) || null;

      // Prepare data for backend (only fields that exist in backend)
      const updateData = {
        name: editedProfile.name,
        email_id: editedProfile.email,
        bio: editedProfile.bio,
        location_name: editedProfile.address,
        years_of_experience: experienceYears,
      };

      // Try to update existing profile
      const updatedProfile = await api.updateProviderProfile(updateData);

      // Update local state with response from backend
      setProfileData({
        name: updatedProfile.name,
        email: updatedProfile.email_id,
        phone: updatedProfile.phone_number,
        address: updatedProfile.location_name,
        specialization: profileData.specialization, // Keep existing (not in backend)
        experience: updatedProfile.years_of_experience
          ? `${updatedProfile.years_of_experience} years`
          : "5 years",
        bio: updatedProfile.bio,
      });

      setIsEditingProfile(false);
      console.log("Profile updated successfully:", updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);

      // If profile doesn't exist (404), try to create it
      if (
        error.message.includes("404") ||
        error.message.includes("not found")
      ) {
        try {
          const experienceYears = parseInt(editedProfile.experience) || null;

          const createData = {
            bio: editedProfile.bio,
            location_name: editedProfile.address,
            years_of_experience: experienceYears,
          };

          const newProfile = await api.createProviderProfile(createData);

          // Update local state with new profile
          setProfileData({
            name: userName,
            email: newProfile.email_id,
            phone: newProfile.phone_number,
            address: newProfile.location_name,
            specialization: profileData.specialization,
            experience: newProfile.years_of_experience
              ? `${newProfile.years_of_experience} years`
              : "5 years",
            bio: newProfile.bio,
          });

          setIsEditingProfile(false);
          console.log("Profile created successfully:", newProfile);
        } catch (createError) {
          console.error("Error creating profile:", createError);
          alert("Failed to save profile. Please try again.");
        }
      } else {
        alert("Failed to save profile. Please try again.");
      }
    }
  };

  return (
    <div className="dashboard-page">
      {/* Provider Header - Same style as Customer */}
      <header className="dashboard-header">
        <div className="header-content">
          <div
            className="user-info"
            onClick={handleShowProfile}
            style={{ cursor: "pointer" }}
          >
            <FaUserCircle className="user-avatar" />
            <div>
              <h2>{t("welcomeBack")}</h2>
              <p className="user-name">{userName}</p>
            </div>
          </div>
          <div className="header-actions">
            <LanguageSwitcher />
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> {t("logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">

        {/* Loading/Error States */}
        {loading && (
          <div className="loading-message">
            <p>Loading dashboard data...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
            <button onClick={fetchProviderData}>Retry</button>
          </div>
        )}

        {/* Stats Cards - Clickable with Detailed Modals */}
        <div className="stats-grid">
          <div 
            className="stat-card stat-clickable"
            onClick={() => setShowReviewsModal(true)}
            title="Click to view all reviews"
          >
            <FaStar className="stat-icon" />
            <div className="stat-info">
              <h4>{t("dashboard.provider.avgRating")}</h4>
              <p className="stat-number">{stats.avg_rating.toFixed(1)}</p>
              <small>{stats.total_reviews} reviews</small>
            </div>
          </div>
          <div 
            className="stat-card stat-clickable"
            onClick={() => setShowCustomersModal(true)}
            title="Click to view served customers"
          >
            <FaCheckCircle className="stat-icon" />
            <div className="stat-info">
              <h4>{t("dashboard.provider.customersServed")}</h4>
              <p className="stat-number">{stats.customers_served}</p>
            </div>
          </div>
          <div
            className="stat-card stat-clickable"
            onClick={handleViewAcceptedJobs}
            title={t("common.clickToView")}
          >
            <FaClipboardList className="stat-icon" />
            <div className="stat-info">
              <h4>{t("dashboard.provider.acceptedJobs")}</h4>
              <p className="stat-number">{stats.accepted_jobs}</p>
            </div>
          )}

          {workRequests.length > 0 ? (
            <div className="requests-grid">
              {workRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="customer-info">
                      <FaUser className="customer-icon" />
                      <div>
                        <h4 className="customer-name">
                          {request.customer_name}
                        </h4>
                        <p className="customer-location">
                          <FaMapMarkerAlt className="location-icon" />
                          {request.location || 'Location not specified'}
                        </p>
                        {request.booking_type === 'scheduled' && (
                          <p className="booking-time">
                            <FaClock /> {request.scheduled_date} at {request.scheduled_time}
                          </p>
                        )}
                        {request.booking_type === 'immediate' && (
                          <span className="immediate-badge">
                            <FaCheckCircle /> Immediate Booking
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="edit-profile-btn">
                      <FaEdit /> Edit Profile
                    </button>
                  </div>
                  
                  <div className="profile-details">
                    <div className="detail-row">
                      <FaPhone />
                      <span>Phone: {providerProfile?.phone || user.phone_number}</span>
                    </div>
                    <div className="detail-row">
                      <FaEnvelope />
                      <span>Email: {providerProfile?.email || 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <FaMapMarkerAlt />
                      <span>Location: {providerProfile?.location_name || 'Not set'}</span>
                    </div>
                    <div className="detail-row">
                      <FaCalendarAlt />
                      <span>Member since: {formatDate(providerProfile?.member_since || user.created_at)}</span>
                    </div>
                    <p className="request-description">{request.description || 'No description provided'}</p>
                    <p className="booking-code">
                      Code: <strong>{request.one_time_code}</strong>
                    </p>
                  </div>

                  <div className="profile-bio">
                    <h3>About</h3>
                    <p>{providerProfile?.bio || 'No bio available'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Accepted Jobs Modal/Overlay */}
        {showAcceptedJobs && (
          <div className="modal-overlay" onClick={handleCloseAcceptedJobs}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{t("dashboard.provider.acceptedJobs")}</h3>
                <button
                  className="modal-close-btn"
                  onClick={handleCloseAcceptedJobs}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                {acceptedJobs.length > 0 ? (
                  <div className="accepted-jobs-list">
                    {acceptedJobs.map((job) => (
                      <div 
                        key={job.id} 
                        className="accepted-job-card clickable-job"
                        onClick={() => {
                          setSelectedJob(job);
                          setShowJobDetails(true);
                        }}
                        title="Click to view full details"
                      >
                        <div className="job-header">
                          <div className="customer-info">
                            <FaUser className="customer-icon" />
                            <div>
                              <h4 className="customer-name">
                                {job.customer_name}
                              </h4>
                              <p className="customer-location">
                                <FaMapMarkerAlt className="location-icon" />
                                {job.location || 'Location not specified'}
                              </p>
                            </div>
                          </div>
                          {job.booking_type && (
                            <div className="booking-type-badge">
                              {job.booking_type === 'immediate' ? (
                                <span className="badge-immediate">
                                  <FaClock /> Immediate
                                </span>
                              ) : (
                                <span className="badge-scheduled">
                                  <FaCalendarAlt /> Scheduled: {job.scheduled_date} at {job.scheduled_time}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="job-body">
                          <div className="service-badge">
                            <FaTools /> {job.service}
                          </div>
                          <p className="job-description">{job.description || 'No description provided'}</p>
                          
                          {/* Display Acceptance Code - Main Feature */}
                          {job.acceptance_code && (
                            <div className="job-code-display acceptance-code">
                              <div className="code-label">
                                <FaClipboardList className="code-icon" />
                                <span>🔑 Acceptance Code (Share with Customer)</span>
                              </div>
                              <div className="code-value-container">
                                <h3 className="code-value">{job.acceptance_code}</h3>
                                <button 
                                  className="copy-code-btn"
                                  onClick={() => {
                                    navigator.clipboard.writeText(job.acceptance_code);
                                    alert('✅ Code copied to clipboard!');
                                  }}
                                  title="Copy code"
                                >
                                  📋 Copy
                                </button>
                              </div>
                              <p className="code-instruction">
                                ⚠️ Customer must enter this code to verify they met the correct provider
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="job-actions">
                          <button
                            className="cancel-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelJob(job.id);
                            }}
                          >
                            <FaTimes /> Cancel
                          </button>
                        </div>
                        <p className="completion-note">
                          ℹ️ Customer will complete this booking after work is finished
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <FaHistory size={48} />
                      <p>No completed jobs yet</p>
                      <small>Your completed jobs will appear here</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Details Modal */}
        {showJobDetails && selectedJob && (
          <div className="modal-overlay" onClick={() => setShowJobDetails(false)}>
            <div className="modal-container job-details-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaSearch /> Job Details</h2>
                <button className="close-btn" onClick={() => setShowJobDetails(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="job-full-details">
                  
                  {/* Customer Information */}
                  <div className="detail-section">
                    <h3>📋 Customer Information</h3>
                    <div className="detail-row">
                      <span className="label">Name:</span>
                      <span className="value">{selectedJob.customer_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedJob.customer_phone}</span>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="detail-section">
                    <h3>🛠️ Service Details</h3>
                    <div className="detail-row">
                      <span className="label">Service:</span>
                      <span className="value">{selectedJob.service}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Type:</span>
                      <span className={`booking-type-badge ${selectedJob.booking_type}`}>
                        {selectedJob.booking_type === 'immediate' ? '⚡ Immediate' : '📅 Scheduled'}
                      </span>
                    </div>
                    {selectedJob.booking_type === 'scheduled' && (
                      <div className="detail-row">
                        <span className="label">Scheduled:</span>
                        <span className="value">{selectedJob.scheduled_date} at {selectedJob.scheduled_time}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Location:</span>
                      <span className="value">{selectedJob.location || 'Not specified'}</span>
                    </div>
                    <div className="detail-row full-width">
                      <span className="label">Description:</span>
                      <span className="value">{selectedJob.description || 'No description provided'}</span>
                    </div>
                  </div>

                  {/* Verification Codes */}
                  <div className="detail-section codes-section">
                    <h3>🔑 Verification Codes</h3>
                    {selectedJob.acceptance_code && (
                      <div className="code-display-box acceptance">
                        <div className="code-header">
                          <span>🔑 Acceptance Code</span>
                          <button 
                            className="copy-code-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(selectedJob.acceptance_code);
                              alert('✅ Code copied!');
                            }}
                          >
                            📋 Copy
                          </button>
                        </div>
                        <div className="code-value-large">{selectedJob.acceptance_code}</div>
                        <p className="code-hint">Share this with customer to verify meeting</p>
                      </div>
                    )}
                    {selectedJob.completion_code && (
                      <div className="code-display-box completion">
                        <div className="code-header">
                          <span>✅ Completion Code</span>
                          <button 
                            className="copy-code-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(selectedJob.completion_code);
                              alert('✅ Code copied!');
                            }}
                          >
                            📋 Copy
                          </button>
                        </div>
                        <div className="code-value-large">{selectedJob.completion_code}</div>
                        <p className="code-hint">Customer needs this to leave a review</p>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="detail-section">
                    <h3>📊 Status</h3>
                    <div className="detail-row">
                      <span className="label">Current Status:</span>
                      <span className={`status-badge-large ${selectedJob.status}`}>{selectedJob.status}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Created:</span>
                      <span className="value">{new Date(selectedJob.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="job-actions-detailed">
                    <button
                      className="action-btn complete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowJobDetails(false);
                        handleCompleteJob(selectedJob.id);
                      }}
                    >
                      <FaCheckCircle /> Complete Job
                    </button>
                    <button
                      className="action-btn cancel-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowJobDetails(false);
                        handleCancelJob(selectedJob.id);
                      }}
                    >
                      <FaTimes /> Cancel Job
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Modal - Show all customer reviews with details */}
        {showReviewsModal && (
          <div className="modal-overlay" onClick={() => setShowReviewsModal(false)}>
            <div className="modal-container large-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaStar /> Customer Reviews</h2>
                <button className="close-btn" onClick={() => setShowReviewsModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {stats.reviews && stats.reviews.length > 0 ? (
                  <div className="reviews-list">
                    {stats.reviews.map((review, index) => (
                      <div key={index} className="review-card">
                        <div className="review-header">
                          <div className="customer-info">
                            <div className="customer-avatar">
                              {review.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4>{review.customer_name}</h4>
                              <p className="review-service">🔧 {review.service}</p>
                            </div>
                          </div>
                          <div className="review-rating">
                            <div className="stars">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
                              ))}
                            </div>
                            <span className="rating-value">{review.rating.toFixed(1)}/5</span>
                          </div>
                        </div>
                        <div className="review-body">
                          <p className="review-comment">
                            {review.comment || <em>No comment provided</em>}
                          </p>
                        </div>
                        <div className="review-footer">
                          <span className="review-date">📅 {review.created_at}</span>
                          <span className="review-phone">📞 {review.customer_phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaStar className="empty-icon" />
                    <p>No reviews yet</p>
                    <p className="empty-subtitle">Complete jobs to receive customer reviews</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Served Customers Modal - Show all customers with details */}
        {showCustomersModal && (
          <div className="modal-overlay" onClick={() => setShowCustomersModal(false)}>
            <div className="modal-container large-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FaUser /> Served Customers</h2>
                <button className="close-btn" onClick={() => setShowCustomersModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {stats.served_customers && stats.served_customers.length > 0 ? (
                  <div className="customers-list">
                    {stats.served_customers.map((customer, index) => (
                      <div key={index} className="customer-card">
                        <div className="customer-card-header">
                          <div className="customer-avatar-large">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="customer-details">
                            <h4>{customer.name}</h4>
                            <p className="customer-phone">📞 {customer.phone}</p>
                          </div>
                        </div>
                        <div className="customer-card-body">
                          <div className="detail-row">
                            <span className="label">🔧 Service:</span>
                            <span className="value">{customer.service}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">📅 Booking Date:</span>
                            <span className="value">{customer.booking_date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaUser className="empty-icon" />
                    <p>No customers served yet</p>
                    <p className="empty-subtitle">Complete bookings to build your customer base</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Customer Dashboard (placeholder)
  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-left">
            <FaUserCircle className="user-avatar" />
            <div className="user-info">
              <h2>Welcome, {user.name}!</h2>
              <span className="user-type">Customer</span>
            </div>
          </div>
          <div className="header-actions">
            <LanguageSwitcher />
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
        
        <div className="customer-dashboard">
          <p>Customer dashboard coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
