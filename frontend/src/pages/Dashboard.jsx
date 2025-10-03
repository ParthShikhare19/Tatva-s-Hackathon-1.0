import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
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
  return (
    <div className="dashboard-content">
      {/* Search Section */}
      <section className="search-section">
        <h3>{t("dashboard.customer.findServices")}</h3>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t("dashboard.customer.searchPlaceholder")}
          />
        </div>
      </section>

      {/* Stats Cards */}
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

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h3>{t("dashboard.customer.browseCategories")}</h3>
          <button className="view-all-btn">{t("common.viewAll")}</button>
        </div>
        <div className="categories-grid">
          <CategoryCard icon={<FaTools />} title={t("categories.plumbing")} />
          <CategoryCard icon={<FaTools />} title={t("categories.electrical")} />
          <CategoryCard icon={<FaTools />} title={t("categories.carpentry")} />
          <CategoryCard icon={<FaTools />} title={t("categories.cleaning")} />
          <CategoryCard icon={<FaTools />} title={t("categories.painting")} />
          <CategoryCard icon={<FaTools />} title={t("categories.gardening")} />
        </div>
      </section>

      {/* Nearby Providers */}
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
      </section>
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
