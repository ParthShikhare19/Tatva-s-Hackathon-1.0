import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import api from "../services/api";
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
  FaPhone,
  FaEnvelope,
  FaEdit,
  FaHistory,
  FaBell,
  FaCog,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";
import "../styles/Dashboard.css";

function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobCode, setJobCode] = useState("ABC123");
  const [timeLeft, setTimeLeft] = useState(900);
  const [activeTab, setActiveTab] = useState("overview");

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

  if (!user) {
    return (
      <div className="dashboard-error">
        <p>Please sign in to access dashboard</p>
        <button onClick={() => navigate("/signin")}>Sign In</button>
      </div>
    );
  }

  // Provider Dashboard
  if (user.role === "provider") {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}
          
          <div className="dashboard-header">
            <div className="header-left">
              <FaUserCircle className="user-avatar" />
              <div className="user-info">
                <h2>Welcome, {user.name}!</h2>
                <span className="user-type">Service Provider</span>
                {providerProfile?.is_verified && (
                  <span className="verified-badge">✓ Verified</span>
                )}
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
        <CustomerDashboard t={t} />
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
function CustomerDashboard({ t }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [showSavedProviders, setShowSavedProviders] = useState(false);
  const [savedProviders, setSavedProviders] = useState([]);
  const providersPerPage = 6;

  // Sample provider data
  const [providers, setProviders] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      service: "Plumbing",
      description: "Expert in all plumbing works with 10+ years experience",
      rating: 4.5,
      location: "Mumbai",
      reviews: 45,
    },
    {
      id: 2,
      name: "Amit Sharma",
      service: "Electrical",
      description: "Licensed electrician specializing in home wiring",
      rating: 4.8,
      location: "Delhi",
      reviews: 62,
    },
    {
      id: 3,
      name: "Priya Patel",
      service: "Cleaning",
      description: "Professional cleaning services for homes and offices",
      rating: 4.6,
      location: "Pune",
      reviews: 38,
    },
    {
      id: 4,
      name: "Suresh Reddy",
      service: "Carpentry",
      description: "Custom furniture and woodwork specialist",
      rating: 4.7,
      location: "Bangalore",
      reviews: 51,
    },
    {
      id: 5,
      name: "Neha Singh",
      service: "Painting",
      description: "Interior and exterior painting with quality finish",
      rating: 4.4,
      location: "Mumbai",
      reviews: 29,
    },
    {
      id: 6,
      name: "Vikram Joshi",
      service: "Gardening",
      description: "Landscaping and garden maintenance expert",
      rating: 4.9,
      location: "Pune",
      reviews: 73,
    },
    {
      id: 7,
      name: "Anita Desai",
      service: "Plumbing",
      description: "Quick and reliable plumbing repairs",
      rating: 4.3,
      location: "Delhi",
      reviews: 34,
    },
    {
      id: 8,
      name: "Rahul Mehta",
      service: "Electrical",
      description: "24/7 emergency electrical services",
      rating: 4.6,
      location: "Bangalore",
      reviews: 48,
    },
  ]);

  const categories = [
    "All",
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Cleaning",
    "Painting",
    "Gardening",
  ];
  const locations = ["All", "Mumbai", "Delhi", "Pune", "Bangalore"];
  const ratings = [
    { label: "All Ratings", value: "all" },
    { label: "4.5+ Stars", value: "4.5" },
    { label: "4.0+ Stars", value: "4.0" },
    { label: "3.5+ Stars", value: "3.5" },
  ];

  // Filter providers based on search and filters
  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      provider.service.toLowerCase() === selectedCategory.toLowerCase();

    const matchesRating =
      selectedRating === "all" || provider.rating >= parseFloat(selectedRating);

    const matchesLocation =
      selectedLocation === "all" ||
      provider.location.toLowerCase() === selectedLocation.toLowerCase();

    return matchesSearch && matchesCategory && matchesRating && matchesLocation;
  });

  // Pagination
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

  const handleSaveProvider = (provider) => {
    const isAlreadySaved = savedProviders.some(p => p.id === provider.id);
    
    if (isAlreadySaved) {
      // Remove from saved
      setSavedProviders(prev => prev.filter(p => p.id !== provider.id));
    } else {
      // Add to saved
      setSavedProviders(prev => [...prev, provider]);
    }
  };

  const isProviderSaved = (providerId) => {
    return savedProviders.some(p => p.id === providerId);
  };

  const handleViewSavedProviders = () => {
    setShowSavedProviders(true);
  };

  const handleCloseSavedProviders = () => {
    setShowSavedProviders(false);
  };

  const handleRemoveSavedProvider = (providerId) => {
    setSavedProviders(prev => prev.filter(p => p.id !== providerId));
  };

  return (
    <div className="dashboard-content">
      {/* Stats Cards - Now on Top */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaCalendarAlt className="stat-icon" />
          <div className="stat-info">
            <h4>{t("dashboard.customer.activeBookings")}</h4>
            <p className="stat-number">0</p>
          </div>
        </div>
        <div className="stat-card">
          <FaClock className="stat-icon" />
          <div className="stat-info">
            <h4>{t("dashboard.customer.bookingHistory")}</h4>
            <p className="stat-number">0</p>
          </div>
        </div>
        <div 
          className="stat-card stat-clickable"
          onClick={handleViewSavedProviders}
          title="Click to view saved providers"
        >
          <FaBookmark className="stat-icon" />
          <div className="stat-info">
            <h4>{t("savedProviders")}</h4>
            <p className="stat-number">{savedProviders.length}</p>
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

        {currentProviders.length > 0 ? (
          <>
            <div className="providers-grid">
              {currentProviders.map((provider) => (
                <div key={provider.id} className="provider-card">
                  <div className="provider-header">
                    <FaUserCircle className="provider-avatar" />
                    <div className="provider-info">
                      <h4 className="provider-name">{provider.name}</h4>
                      <div className="provider-rating">
                        <FaStar className="star-icon" />
                        <span className="rating-value">{provider.rating}</span>
                        <span className="reviews-count">
                          ({provider.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="provider-body">
                    <div className="service-badge">
                      <FaTools /> {provider.service}
                    </div>
                    <p className="provider-description">
                      {provider.description}
                    </p>
                    <div className="provider-location">
                      <FaMapMarkerAlt className="location-icon" />
                      <span>{provider.location}</span>
                    </div>
                  </div>
                  <div className="provider-actions">
                    <button className="book-btn">Book Now</button>
                    <button 
                      className={`save-btn ${isProviderSaved(provider.id) ? 'saved' : ''}`}
                      onClick={() => handleSaveProvider(provider)}
                      title={isProviderSaved(provider.id) ? "Remove from saved" : "Save provider"}
                    >
                      {isProviderSaved(provider.id) ? <FaBookmark /> : <FaRegBookmark />}
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

      {/* Saved Providers Modal */}
      {showSavedProviders && (
        <div className="modal-overlay" onClick={handleCloseSavedProviders}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Saved Providers</h3>
              <button className="modal-close-btn" onClick={handleCloseSavedProviders}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {savedProviders.length > 0 ? (
                <div className="saved-providers-list">
                  {savedProviders.map((provider) => (
                    <div key={provider.id} className="saved-provider-card">
                      <div className="provider-header">
                        <FaUserCircle className="provider-avatar" />
                        <div className="provider-info">
                          <h4 className="provider-name">{provider.name}</h4>
                          <div className="provider-rating">
                            <FaStar className="star-icon" />
                            <span className="rating-value">{provider.rating}</span>
                            <span className="reviews-count">({provider.reviews} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <div className="provider-body">
                        <div className="service-badge">
                          <FaTools /> {provider.service}
                        </div>
                        <p className="provider-description">{provider.description}</p>
                        <div className="provider-location">
                          <FaMapMarkerAlt className="location-icon" />
                          <span>{provider.location}</span>
                        </div>
                      </div>
                      <div className="provider-actions">
                        <button className="book-btn">Book Now</button>
                        <button 
                          className="remove-btn"
                          onClick={() => handleRemoveSavedProvider(provider.id)}
                        >
                          <FaTimes /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaBookmark className="empty-icon" />
                  <p>No saved providers yet</p>
                  <p className="empty-subtitle">Save providers to easily find them later</p>
                </div>
              )}
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

  // New requests waiting for accept/reject
  const [workRequests, setWorkRequests] = useState([
    {
      id: 1,
      customerName: "John Doe",
      location: "Mumbai, Maharashtra",
      service: "Plumbing",
      description: "Kitchen sink repair needed",
    },
    {
      id: 2,
      customerName: "Sarah Smith",
      location: "Pune, Maharashtra",
      service: "Electrical",
      description: "Wiring issue in bedroom",
    },
    {
      id: 3,
      customerName: "Raj Patel",
      location: "Ahmedabad, Gujarat",
      service: "Carpentry",
      description: "Door frame repair",
    },
  ]);

  // Accepted jobs that are not yet completed
  const [acceptedJobs, setAcceptedJobs] = useState([
    {
      id: 101,
      customerName: "Maria Garcia",
      location: "Delhi, NCR",
      service: "Plumbing",
      description: "Bathroom pipe leakage",
      acceptedDate: "2025-10-01",
      oneTimeCode: 123456,
    },
    {
      id: 102,
      customerName: "David Wilson",
      location: "Bangalore, Karnataka",
      service: "Electrical",
      description: "AC installation required",
      acceptedDate: "2025-10-02",
      oneTimeCode: 789012,
    },
  ]);

  // Generate a unique 6-digit code
  const generateUniqueCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  const handleAcceptRequest = (request) => {
    // Generate a unique code for this request
    const code = generateUniqueCode();

    // Move from workRequests to acceptedJobs with code
    setAcceptedJobs((prev) => [
      ...prev,
      {
        ...request,
        id: Date.now(), // Generate new ID for accepted job
        acceptedDate: new Date().toISOString().split("T")[0],
        oneTimeCode: code,
      },
    ]);
    setWorkRequests((prev) => prev.filter((req) => req.id !== request.id));
    // TODO: Send accept request to backend
    console.log("Accepted request:", request.id, "Code:", code);
  };

  const handleRejectRequest = (requestId) => {
    // Show confirmation dialog in selected language
    const confirmed = window.confirm(t("common.confirmRejectRequest"));

    if (confirmed) {
      setWorkRequests((prev) => prev.filter((req) => req.id !== requestId));
      // TODO: Send reject request to backend
      console.log("Rejected request:", requestId);
    }
  };

  const handleCancelJob = (jobId) => {
    // Show confirmation dialog in selected language
    const confirmed = window.confirm(t("common.confirmCancelJob"));

    if (confirmed) {
      setAcceptedJobs((prev) => prev.filter((job) => job.id !== jobId));
      // TODO: Send cancel job request to backend
      console.log("Cancelled job:", jobId);
    }
  };

          {activeTab === 'jobs' && (
            <div className="tab-content">
              <div className="jobs-grid">
                
                <div className="job-section">
                  <h3><FaClock /> Pending Requests ({pendingRequests.length})</h3>
                  <div className="job-list">
                    {pendingRequests.length > 0 ? (
                      pendingRequests.map((request) => (
                        <div key={request.id} className={`job-card pending ${request.urgency}`}>
                          <div className="job-header">
                            <h4>{request.title}</h4>
                            <span className="job-price">₹{request.price}</span>
                          </div>
                          <p className="job-description">{request.description}</p>
                          <div className="job-details">
                            <div className="job-location">
                              <FaMapMarkerAlt /> {request.location}
                            </div>
                            <div className="job-customer">
                              <FaUser /> {request.customer_name}
                            </div>
                            <div className="job-phone">
                              <FaPhone /> {request.customer_phone}
                            </div>
                            <div className="job-time">
                              <FaClock /> {formatDate(request.created_at)}
                            </div>
                          </div>
                          <div className="job-actions">
                            <button 
                              className="accept-btn"
                              onClick={() => handleAcceptJob(request.id)}
                            >
                              <FaCheck /> Accept
                            </button>
                            <button 
                              className="reject-btn"
                              onClick={() => handleRejectJob(request.id)}
                            >
                              <FaTimes /> Reject
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-data">
                        <FaClock size={48} />
                        <p>No pending work requests</p>
                        <small>New requests will appear here</small>
                      </div>
                    )}
                  </div>
                </div>

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

              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="tab-content">
              <div className="profile-section">
                <div className="profile-card">
                  <div className="profile-header">
                    <FaUserCircle size={80} />
                    <div className="profile-info">
                      <h2>{user.name}</h2>
                      <p>{providerProfile?.service_type || 'Service Provider'}</p>
                      {providerProfile?.is_verified && (
                        <span className="verified-badge">✓ Verified Provider</span>
                      )}
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
                  </div>

                  <div className="profile-bio">
                    <h3>About</h3>
                    <p>{providerProfile?.bio || 'No bio available'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-content">
              <div className="history-section">
                <h3><FaHistory /> Completed Jobs ({completedJobs.length})</h3>
                <div className="job-list">
                  {completedJobs.length > 0 ? (
                    completedJobs.map((job) => (
                      <div key={job.id} className="job-card completed">
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
                          <div className="job-time">
                            <FaCheckCircle /> Completed: {formatDate(job.completed_at)}
                          </div>
                          <p className="job-description">{job.description}</p>

                          {/* Display One-Time Code */}
                          {job.oneTimeCode && (
                            <div className="job-code-display">
                              <div className="code-label">
                                <FaClipboardList className="code-icon" />
                                <span>
                                  {t("dashboard.provider.yourOneTimeCode")}
                                </span>
                              </div>
                              <div className="code-value-container">
                                <h3 className="code-value">
                                  {job.oneTimeCode}
                                </h3>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="job-actions">
                          <button
                            className="cancel-btn"
                            onClick={() => handleCancelJob(job.id)}
                          >
                            <FaTimes /> {t("dashboard.provider.cancelRequest")}
                          </button>
                        </div>
                        {job.rating && (
                          <div className="job-rating">
                            <div className="stars">
                              {[...Array(5)].map((_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={i < job.rating ? 'filled' : 'empty'} 
                                />
                              ))}
                            </div>
                            {job.review && <p className="review">"{job.review}"</p>}
                          </div>
                        )}
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
          )}

        </div>
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
