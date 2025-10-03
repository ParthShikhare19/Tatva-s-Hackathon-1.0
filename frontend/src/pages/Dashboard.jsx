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
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    navigate("/");
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

          <div className="dashboard-tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
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
            <button 
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory /> History
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="stats-grid">
                <div className="stat-card earnings">
                  <FaMoneyBillWave className="stat-icon" />
                  <div className="stat-info">
                    <h3>₹{providerProfile?.total_earnings || 0}</h3>
                    <p>Total Earnings</p>
                  </div>
                </div>

                <div className="stat-card jobs">
                  <FaTools className="stat-icon" />
                  <div className="stat-info">
                    <h3>{providerProfile?.jobs_completed || 0}</h3>
                    <p>Jobs Completed</p>
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
