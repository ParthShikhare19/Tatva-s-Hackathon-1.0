import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { FaTools, FaUser, FaMapMarkerAlt, FaEnvelope, FaPhone, FaWrench, FaFileAlt, FaClock, FaLock } from 'react-icons/fa';
import '../styles/Auth.css';

const SignUpProvider = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    email: '',
    mobile: '',
    serviceName: '',
    serviceDescription: '',
    experience: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <LanguageSwitcher />
      
      <div className="auth-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← {t('backToHome')}
        </button>
        
        <div className="auth-header">
          <div className="logo-icon"><FaTools /></div>
          <h1>{t('providerSignUp')}</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-icon"><FaUser /></div>
            <input
              type="text"
              placeholder={t('name')}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <div className="input-icon"><FaMapMarkerAlt /></div>
            <input
              type="text"
              placeholder={t('location')}
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <div className="input-icon"><FaEnvelope /></div>
            <input
              type="email"
              placeholder={t('email')}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <div className="input-icon"><FaPhone /></div>
            <input
              type="tel"
              placeholder={t('mobile')}
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <div className="input-icon"><FaWrench /></div>
            <input
              type="text"
              placeholder={t('serviceName')}
              value={formData.serviceName}
              onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <div className="input-icon"><FaFileAlt /></div>
            <textarea
              placeholder={t('serviceDescription')}
              value={formData.serviceDescription}
              onChange={(e) => setFormData({...formData, serviceDescription: e.target.value})}
              required
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <div className="input-icon"><FaClock /></div>
            <input
              type="number"
              placeholder={t('experience')}
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              required
              min="0"
            />
          </div>
          
          <div className="form-group">
            <div className="input-icon"><FaLock /></div>
            <input
              type="password"
              placeholder={t('password')}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button type="submit" className="submit-button">
            {t('submit')} →
          </button>
        </form>
        
        <div className="auth-footer">
          <p>{t('alreadyHaveAccount')}</p>
          <button onClick={() => navigate('/signin')} className="link-button">
            {t('signIn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpProvider;
