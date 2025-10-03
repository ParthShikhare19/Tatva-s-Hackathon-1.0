import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
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
} from "react-icons/fa";
import ApiService from "../services/api";
import "../styles/Dashboard.css";

function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user info from localStorage
    const storedUserType = localStorage.getItem("userType");
    const storedUserName = localStorage.getItem("userName");

    if (storedUserType) {
      setUserType(storedUserType);
      setUserName(storedUserName || "User");
    } else {
      // If no user type found, redirect to sign in
      navigate("/signin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    navigate("/");
  };

  if (!userType) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      {/* Header - Only for Customer */}
      {userType === "customer" && (
        <header className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
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
  const [showFilters, setShowFilters] = useState(false);
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState({ active_bookings: 0, booking_history: 0, saved_providers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const providersPerPage = 6;

  const categories = ["All", "Plumbing", "Electrical", "Carpentry", "Cleaning", "Painting", "Gardening"];
  const locations = ["All", "Mumbai", "Delhi", "Pune", "Bangalore"];
  const ratings = [
    { label: "All Ratings", value: "all" },
    { label: "4.5+ Stars", value: "4.5" },
    { label: "4.0+ Stars", value: "4.0" },
    { label: "3.5+ Stars", value: "3.5" },
  ];

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
  const currentProviders = filteredProviders.slice(indexOfFirstProvider, indexOfLastProvider);
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        `\nBooking Code: ${response.one_time_code}\n\n` +
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
      {/* Stats Cards - Now on Top */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaCalendarAlt className="stat-icon" />
          <div className="stat-info">
            <h4>{t("dashboard.customer.activeBookings")}</h4>
            <p className="stat-number">{stats.active_bookings}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaClock className="stat-icon" />
          <div className="stat-info">
            <h4>{t("dashboard.customer.bookingHistory")}</h4>
            <p className="stat-number">{stats.booking_history}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaHeart className="stat-icon" />
          <div className="stat-info">
            <h4>{t("dashboard.customer.savedProviders")}</h4>
            <p className="stat-number">{stats.saved_providers}</p>
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
              className={`category-pill ${selectedCategory === (category === "All" ? "all" : category) ? "active" : ""}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
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
                  <option key={location} value={location === "All" ? "all" : location}>
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
              Clear All Filters
            </button>
          </div>
        )}
      </section>

      {/* Service Providers Section */}
      <section className="providers-section">
        <div className="section-header">
          <h3>{t("dashboard.customer.nearbyProviders")}</h3>
          <button className="view-all-btn">{t("common.viewAll")}</button>
        </div>
        <div className="empty-state">
          <FaMapMarkerAlt className="empty-icon" />
          <p>{t("common.noDataYet")}</p>
          <button className="get-started-btn">{t("common.getStarted")}</button>
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
                      <FaHeart />
                    </button>
                  </div>
                </div>
              ))}
            </div>

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
                      className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
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
            <p className="empty-subtitle">Try adjusting your search or filters</p>
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
    setWorkRequests((prev) => prev.filter((req) => req.id !== requestId));
    // TODO: Send reject request to backend
    console.log("Rejected request:", requestId);
  };

  const handleCancelJob = (jobId) => {
    setAcceptedJobs((prev) => prev.filter((job) => job.id !== jobId));
    // TODO: Send cancel job request to backend
    console.log("Cancelled job:", jobId);
  };

  const handleViewAcceptedJobs = () => {
    setShowAcceptedJobs(true);
  };

  const handleCloseAcceptedJobs = () => {
    setShowAcceptedJobs(false);
  };

  return (
    <div className="dashboard-page">
      {/* Provider Header - Same style as Customer */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
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
        {/* Welcome Message */}
        <section className="welcome-section">
          <h3>
            {t("common.welcome")} {userName}
          </h3>
        </section>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <FaStar className="stat-icon" />
            <div className="stat-info">
              <h4>{t("dashboard.provider.avgRating")}</h4>
              <p className="stat-number">0.0</p>
            </div>
          </div>
          <div className="stat-card">
            <FaCheckCircle className="stat-icon" />
            <div className="stat-info">
              <h4>{t("dashboard.provider.customersServed")}</h4>
              <p className="stat-number">0</p>
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
              <p className="stat-number">{acceptedJobs.length}</p>
            </div>
          </div>
        </div>

        {/* Work Requests Section */}
        <section className="work-requests-section">
          <div className="section-header">
            <h3>{t("dashboard.provider.workRequests")}</h3>
            <span className="requests-count">
              {workRequests.length} {t("common.pending")}
            </span>
          </div>

          {workRequests.length > 0 ? (
            <div className="requests-grid">
              {workRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="customer-info">
                      <FaUser className="customer-icon" />
                      <div>
                        <h4 className="customer-name">
                          {request.customerName}
                        </h4>
                        <p className="customer-location">
                          <FaMapMarkerAlt className="location-icon" />
                          {request.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="request-body">
                    <div className="service-badge">
                      <FaTools /> {request.service}
                    </div>
                    <p className="request-description">{request.description}</p>
                  </div>
                  <div className="request-actions">
                    <button
                      className="accept-btn"
                      onClick={() => handleAcceptRequest(request)}
                    >
                      <FaCheck /> {t("common.accept")}
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      <FaTimes /> {t("common.reject")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaClipboardList className="empty-icon" />
              <p>{t("dashboard.provider.noPendingRequests")}</p>
              <p className="empty-subtitle">
                {t("dashboard.provider.newRequestsAppear")}
              </p>
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
                      <div key={job.id} className="accepted-job-card">
                        <div className="job-header">
                          <div className="customer-info">
                            <FaUser className="customer-icon" />
                            <div>
                              <h4 className="customer-name">
                                {job.customerName}
                              </h4>
                              <p className="customer-location">
                                <FaMapMarkerAlt className="location-icon" />
                                {job.location}
                              </p>
                            </div>
                          </div>
                          <div className="accepted-date">
                            <FaCalendarAlt className="date-icon" />
                            <span>
                              {t("common.accepted")}: {job.acceptedDate}
                            </span>
                          </div>
                        </div>
                        <div className="job-body">
                          <div className="service-badge">
                            <FaTools /> {job.service}
                          </div>
                          <p className="job-description">{job.description}</p>
                          
                          {/* Display One-Time Code */}
                          {job.oneTimeCode && (
                            <div className="job-code-display">
                              <div className="code-label">
                                <FaClipboardList className="code-icon" />
                                <span>{t("dashboard.provider.yourOneTimeCode")}</span>
                              </div>
                              <div className="code-value-container">
                                <h3 className="code-value">{job.oneTimeCode}</h3>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="job-actions">
                          <button
                            className="cancel-btn"
                            onClick={() => handleCancelJob(job.id)}
                          >
                            <FaTimes />{" "}
                            {t("dashboard.provider.cancelRequest")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaCheckCircle className="empty-icon" />
                    <p>{t("dashboard.provider.noAcceptedJobs")}</p>
                    <p className="empty-subtitle">
                      {t("dashboard.provider.jobsYouAccept")}
                    </p>
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

// Category Card Component
function CategoryCard({ icon, title }) {
  return (
    <div className="category-card">
      <div className="category-icon">{icon}</div>
      <p className="category-title">{title}</p>
    </div>
  );
}

export default Dashboard;
