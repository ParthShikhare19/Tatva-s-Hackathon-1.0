import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  FaUserCircle, FaSearch, FaTools, FaCalendarAlt, FaHeart, FaStar, 
  FaMoneyBillWave, FaClipboardList, FaChartLine, FaPlus, FaSignOutAlt,
  FaMapMarkerAlt, FaClock, FaCheckCircle
} from 'react-icons/fa';
import '../styles/Dashboard.css';

function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user info from localStorage
    const storedUserType = localStorage.getItem('userType');
    const storedUserName = localStorage.getItem('userName');
    
    if (storedUserType) {
      setUserType(storedUserType);
      setUserName(storedUserName || 'User');
    } else {
      // If no user type found, redirect to sign in
      navigate('/signin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    navigate('/');
  };

  if (!userType) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <FaUserCircle className="user-avatar" />
            <div>
              <h2>{t('welcomeBack')}</h2>
              <p className="user-name">{userName}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> {t('logout')}
          </button>
        </div>
      </header>

      {userType === 'customer' ? <CustomerDashboard t={t} /> : <ProviderDashboard t={t} />}
    </div>
  );
}

// Customer Dashboard Component
function CustomerDashboard({ t }) {
  return (
    <div className="dashboard-content">
      {/* Search Section */}
      <section className="search-section">
        <h3>{t('findServices')}</h3>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder={t('searchPlaceholder')} />
        </div>
      </section>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaCalendarAlt className="stat-icon" />
          <div className="stat-info">
            <h4>{t('activeBookings')}</h4>
            <p className="stat-number">0</p>
          </div>
        </div>
        <div className="stat-card">
          <FaClock className="stat-icon" />
          <div className="stat-info">
            <h4>{t('bookingHistory')}</h4>
            <p className="stat-number">0</p>
          </div>
        </div>
        <div className="stat-card">
          <FaHeart className="stat-icon" />
          <div className="stat-info">
            <h4>{t('savedProviders')}</h4>
            <p className="stat-number">0</p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h3>{t('browseCategories')}</h3>
          <button className="view-all-btn">{t('viewAll')}</button>
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
          <h3>{t('nearbyProviders')}</h3>
          <button className="view-all-btn">{t('viewAll')}</button>
        </div>
        <div className="empty-state">
          <FaMapMarkerAlt className="empty-icon" />
          <p>{t('noDataYet')}</p>
          <button className="get-started-btn">{t('getStarted')}</button>
        </div>
      </section>
    </div>
  );
}

// Provider Dashboard Component
function ProviderDashboard({ t }) {
  return (
    <div className="dashboard-content">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <FaMoneyBillWave className="stat-icon" />
          <div className="stat-info">
            <h4>{t('totalEarnings')}</h4>
            <p className="stat-number">₹0</p>
          </div>
        </div>
        <div className="stat-card stat-warning">
          <FaClipboardList className="stat-icon" />
          <div className="stat-info">
            <h4>{t('pendingRequests')}</h4>
            <p className="stat-number">0</p>
          </div>
        </div>
        <div className="stat-card stat-success">
          <FaCheckCircle className="stat-icon" />
          <div className="stat-info">
            <h4>{t('completedJobs')}</h4>
            <p className="stat-number">0</p>
          </div>
        </div>
        <div className="stat-card stat-info">
          <FaStar className="stat-icon" />
          <div className="stat-info">
            <h4>{t('averageRating')}</h4>
            <p className="stat-number">0.0</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="quick-actions">
        <button className="action-btn action-primary">
          <FaPlus /> {t('addService')}
        </button>
      </section>

      {/* Service Requests */}
      <section className="requests-section">
        <div className="section-header">
          <h3>{t('serviceRequests')}</h3>
          <button className="view-all-btn">{t('viewAll')}</button>
        </div>
        <div className="empty-state">
          <FaClipboardList className="empty-icon" />
          <p>{t('noDataYet')}</p>
          <p className="empty-subtitle">{t('getStarted')}</p>
        </div>
      </section>

      {/* My Services */}
      <section className="services-section">
        <div className="section-header">
          <h3>{t('myServices')}</h3>
          <button className="view-all-btn">{t('viewAll')}</button>
        </div>
        <div className="empty-state">
          <FaTools className="empty-icon" />
          <p>{t('noDataYet')}</p>
          <button className="get-started-btn">
            <FaPlus /> {t('addService')}
          </button>
        </div>
      </section>

      {/* Earnings Chart Placeholder */}
      <section className="earnings-section">
        <div className="section-header">
          <h3>{t('earnings')}</h3>
        </div>
        <div className="chart-placeholder">
          <FaChartLine className="chart-icon" />
          <p>{t('noDataYet')}</p>
        </div>
      </section>
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
