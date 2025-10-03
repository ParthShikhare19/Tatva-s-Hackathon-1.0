import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
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
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> {t("logout")}
            </button>
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
        <h3>{t("findServices")}</h3>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder={t("searchPlaceholder")} />
        </div>
      </section>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaCalendarAlt className="stat-icon" />
          <div className="stat-info">
            <h4>{t("activeBookings")}</h4>
            <p className="stat-number">0</p>
          </div>
        </div>
        <div className="stat-card">
          <FaClock className="stat-icon" />
          <div className="stat-info">
            <h4>{t("bookingHistory")}</h4>
            <p className="stat-number">0</p>
          </div>
        </div>
        <div className="stat-card">
          <FaHeart className="stat-icon" />
          <div className="stat-info">
            <h4>{t("savedProviders")}</h4>
            <p className="stat-number">0</p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h3>{t("browseCategories")}</h3>
          <button className="view-all-btn">{t("viewAll")}</button>
        </div>
        <div className="categories-grid">
          <CategoryCard icon={<FaTools />} title="Plumbing" />
          <CategoryCard icon={<FaTools />} title="Electrical" />
          <CategoryCard icon={<FaTools />} title="Carpentry" />
          <CategoryCard icon={<FaTools />} title="Cleaning" />
          <CategoryCard icon={<FaTools />} title="Painting" />
          <CategoryCard icon={<FaTools />} title="Gardening" />
        </div>
      </section>

      {/* Nearby Providers */}
      <section className="providers-section">
        <div className="section-header">
          <h3>{t("nearbyProviders")}</h3>
          <button className="view-all-btn">{t("viewAll")}</button>
        </div>
        <div className="empty-state">
          <FaMapMarkerAlt className="empty-icon" />
          <p>{t("noDataYet")}</p>
          <button className="get-started-btn">{t("getStarted")}</button>
        </div>
      </section>
    </div>
  );
}

// Provider Dashboard Component
function ProviderDashboard({ t, userName, handleLogout }) {
  const [oneTimeCode, setOneTimeCode] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
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
    },
    {
      id: 102,
      customerName: "David Wilson",
      location: "Bangalore, Karnataka",
      service: "Electrical",
      description: "AC installation required",
      acceptedDate: "2025-10-02",
    },
  ]);

  const handleGenerateCode = () => {
    // Generate a random 6-digit code for now
    const code = Math.floor(100000 + Math.random() * 900000);
    setOneTimeCode(code);
    // Set timer for 5 minutes (300 seconds)
    setTimeLeft(300);
    // TODO: Send this code to backend
  };

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) {
        setOneTimeCode(null);
        setTimeLeft(null);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setOneTimeCode(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAcceptRequest = (request) => {
    // Move from workRequests to acceptedJobs
    setAcceptedJobs((prev) => [
      ...prev,
      {
        ...request,
        id: Date.now(), // Generate new ID for accepted job
        acceptedDate: new Date().toISOString().split('T')[0],
      },
    ]);
    setWorkRequests((prev) => prev.filter((req) => req.id !== request.id));
    // TODO: Send accept request to backend
    console.log("Accepted request:", request.id);
  };

  const handleRejectRequest = (requestId) => {
    setWorkRequests((prev) => prev.filter((req) => req.id !== requestId));
    // TODO: Send reject request to backend
    console.log("Rejected request:", requestId);
  };

  const handleCompleteJob = (jobId) => {
    setAcceptedJobs((prev) => prev.filter((job) => job.id !== jobId));
    // TODO: Send complete job request to backend
    console.log("Completed job:", jobId);
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
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> {t("logout")}
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Welcome Message */}
        <section className="welcome-section">
          <h3>Welcome {userName}</h3>
        </section>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <FaStar className="stat-icon" />
            <div className="stat-info">
              <h4>{t("averageRating")}</h4>
              <p className="stat-number">0.0</p>
            </div>
          </div>
          <div className="stat-card">
            <FaCheckCircle className="stat-icon" />
            <div className="stat-info">
              <h4>Customers Served</h4>
              <p className="stat-number">0</p>
            </div>
          </div>
          <div 
            className="stat-card stat-clickable" 
            onClick={handleViewAcceptedJobs}
            title="Click to view accepted jobs"
          >
            <FaClipboardList className="stat-icon" />
            <div className="stat-info">
              <h4>Accepted Jobs (Pending Completion)</h4>
              <p className="stat-number">{acceptedJobs.length}</p>
            </div>
          </div>
        </div>

        {/* Generate One-Time Code Button */}
        <section className="code-generation-section">
          <button className="generate-code-btn" onClick={handleGenerateCode}>
            <FaPlus /> Generate One-Time Code
          </button>
          {oneTimeCode && (
            <div className="code-display">
              <p>Your One-Time Code:</p>
              <h2 className="code-value">{oneTimeCode}</h2>
              {timeLeft && (
                <div className="code-timer">
                  <FaClock className="timer-icon" />
                  <p className="timer-text">
                    Expires in: <span className="timer-value">{formatTime(timeLeft)}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Work Requests Section */}
        <section className="work-requests-section">
          <div className="section-header">
            <h3>Work Requests from Customers</h3>
            <span className="requests-count">{workRequests.length} pending</span>
          </div>
          
          {workRequests.length > 0 ? (
            <div className="requests-grid">
              {workRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="customer-info">
                      <FaUser className="customer-icon" />
                      <div>
                        <h4 className="customer-name">{request.customerName}</h4>
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
                      <FaCheck /> Accept
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      <FaTimes /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaClipboardList className="empty-icon" />
              <p>No pending work requests</p>
              <p className="empty-subtitle">New requests will appear here</p>
            </div>
          )}
        </section>

        {/* Accepted Jobs Modal/Overlay */}
        {showAcceptedJobs && (
          <div className="modal-overlay" onClick={handleCloseAcceptedJobs}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Accepted Jobs (Pending Completion)</h3>
                <button className="modal-close-btn" onClick={handleCloseAcceptedJobs}>
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
                              <h4 className="customer-name">{job.customerName}</h4>
                              <p className="customer-location">
                                <FaMapMarkerAlt className="location-icon" />
                                {job.location}
                              </p>
                            </div>
                          </div>
                          <div className="accepted-date">
                            <FaCalendarAlt className="date-icon" />
                            <span>Accepted: {job.acceptedDate}</span>
                          </div>
                        </div>
                        <div className="job-body">
                          <div className="service-badge">
                            <FaTools /> {job.service}
                          </div>
                          <p className="job-description">{job.description}</p>
                        </div>
                        <div className="job-actions">
                          <button
                            className="complete-btn"
                            onClick={() => handleCompleteJob(job.id)}
                          >
                            <FaCheckCircle /> Mark as Completed
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaCheckCircle className="empty-icon" />
                    <p>No accepted jobs pending completion</p>
                    <p className="empty-subtitle">Jobs you accept will appear here</p>
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
