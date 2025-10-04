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
  FaEdit,
  FaSave,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaBriefcase,
} from "react-icons/fa";
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
    // Show confirmation dialog in selected language
    const confirmed = window.confirm(t("common.confirmLogout"));

    if (confirmed) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userType");
      localStorage.removeItem("userName");
      navigate("/");
    }
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
        <div className="stat-card">
          <FaHeart className="stat-icon" />
          <div className="stat-info">
            <h4>{t("dashboard.customer.savedProviders")}</h4>
            <p className="stat-number">0</p>
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
                    <button className="save-btn">
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
          email: "provider@example.com", // Not in backend yet
          phone: data.phone_number || "+91 9876543210",
          address: data.location_name || "Mumbai, Maharashtra",
          specialization: "Plumbing, Electrical", // Not in backend yet
          experience: "5 years", // Not in backend yet
          bio: data.bio || "Professional service provider with expertise in multiple domains.",
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

  const handleViewAcceptedJobs = () => {
    setShowAcceptedJobs(true);
  };

  const handleCloseAcceptedJobs = () => {
    setShowAcceptedJobs(false);
  };

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
      // Prepare data for backend (only fields that exist in backend)
      const updateData = {
        name: editedProfile.name,
        bio: editedProfile.bio,
        location_name: editedProfile.address,
      };

      // Try to update existing profile
      const updatedProfile = await api.updateProviderProfile(updateData);
      
      // Update local state with response from backend
      setProfileData({
        name: updatedProfile.name,
        email: profileData.email, // Keep existing (not in backend)
        phone: updatedProfile.phone_number,
        address: updatedProfile.location_name,
        specialization: profileData.specialization, // Keep existing (not in backend)
        experience: profileData.experience, // Keep existing (not in backend)
        bio: updatedProfile.bio,
      });
      
      setIsEditingProfile(false);
      console.log("Profile updated successfully:", updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // If profile doesn't exist (404), try to create it
      if (error.message.includes("404") || error.message.includes("not found")) {
        try {
          const createData = {
            bio: editedProfile.bio,
            location_name: editedProfile.address,
          };
          
          const newProfile = await api.createProviderProfile(createData);
          
          // Update local state with new profile
          setProfileData({
            name: userName,
            email: profileData.email,
            phone: newProfile.phone_number,
            address: newProfile.location_name,
            specialization: profileData.specialization,
            experience: profileData.experience,
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

        {/* Profile Modal */}
        {showProfile && (
          <div className="modal-overlay" onClick={handleCloseProfile}>
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
                  onClick={handleCloseProfile}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body profile-body">
                {!isEditingProfile ? (
                  /* View Mode */
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
                          <p>{profileData.email}</p>
                        </div>
                      </div>

                      <div className="profile-info-item">
                        <FaPhone className="profile-icon" />
                        <div>
                          <label>Phone</label>
                          <p>{profileData.phone}</p>
                        </div>
                      </div>

                      <div className="profile-info-item">
                        <FaHome className="profile-icon" />
                        <div>
                          <label>Address</label>
                          <p>{profileData.address}</p>
                        </div>
                      </div>

                      <div className="profile-info-item">
                        <FaTools className="profile-icon" />
                        <div>
                          <label>Specialization</label>
                          <p>{profileData.specialization}</p>
                        </div>
                      </div>

                      <div className="profile-info-item">
                        <FaBriefcase className="profile-icon" />
                        <div>
                          <label>Experience</label>
                          <p>{profileData.experience}</p>
                        </div>
                      </div>

                      <div className="profile-info-item full-width">
                        <FaClipboardList className="profile-icon" />
                        <div>
                          <label>Bio</label>
                          <p>{profileData.bio}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-actions">
                      <button
                        className="edit-profile-btn"
                        onClick={handleEditProfile}
                      >
                        <FaEdit /> Edit Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode */
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
                          value={editedProfile.name}
                          onChange={(e) =>
                            handleProfileChange("name", e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          <FaEnvelope className="form-icon" /> Email
                        </label>
                        <input
                          type="email"
                          value={editedProfile.email}
                          onChange={(e) =>
                            handleProfileChange("email", e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          <FaPhone className="form-icon" /> Phone
                        </label>
                        <input
                          type="tel"
                          value={editedProfile.phone}
                          onChange={(e) =>
                            handleProfileChange("phone", e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          <FaHome className="form-icon" /> Address
                        </label>
                        <input
                          type="text"
                          value={editedProfile.address}
                          onChange={(e) =>
                            handleProfileChange("address", e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          <FaTools className="form-icon" /> Specialization
                        </label>
                        <input
                          type="text"
                          value={editedProfile.specialization}
                          onChange={(e) =>
                            handleProfileChange(
                              "specialization",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          <FaBriefcase className="form-icon" /> Experience
                        </label>
                        <input
                          type="text"
                          value={editedProfile.experience}
                          onChange={(e) =>
                            handleProfileChange("experience", e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>
                          <FaClipboardList className="form-icon" /> Bio
                        </label>
                        <textarea
                          rows="4"
                          value={editedProfile.bio}
                          onChange={(e) =>
                            handleProfileChange("bio", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="profile-actions">
                      <button
                        className="save-profile-btn"
                        onClick={handleSaveProfile}
                      >
                        <FaSave /> Save Changes
                      </button>
                      <button
                        className="cancel-edit-btn"
                        onClick={handleCancelEdit}
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
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
