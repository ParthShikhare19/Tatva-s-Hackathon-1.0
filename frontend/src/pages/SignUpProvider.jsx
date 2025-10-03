import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { FaTools, FaUser, FaMapMarkerAlt, FaEnvelope, FaPhone, FaWrench, FaFileAlt, FaClock, FaLock } from 'react-icons/fa';
import '../styles/Auth.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.mobile,
          name: formData.name,
          password: formData.password,
          user_type: 'provider',
          location: formData.location,
          service: formData.serviceName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      localStorage.setItem('authToken', data.access_token);
      navigate('/dashboard');

    } catch (error) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← {t('backToHome')}
        </button>
        
        <div className="auth-header">
          <div className="logo-icon">
            <FaTools />
          </div>
          <h1>{t('providerSignUp')}</h1>
        </div>

        <LanguageSwitcher />

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <div className="input-icon">
              <FaUser />
            </div>
            <input
              type="text"
              name="name"
              placeholder={t('name')}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FaMapMarkerAlt />
            </div>
            <input
              type="text"
              name="location"
              placeholder={t('location')}
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FaEnvelope />
            </div>
            <input
              type="email"
              name="email"
              placeholder={t('email')}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FaPhone />
            </div>
            <input
              type="tel"
              name="mobile"
              placeholder={t('mobile')}
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FaWrench />
            </div>
            <input
              type="text"
              name="serviceName"
              placeholder={t('serviceName')}
              value={formData.serviceName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FaFileAlt />
            </div>
            <textarea
              name="serviceDescription"
              placeholder={t('serviceDescription')}
              value={formData.serviceDescription}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FaClock />
            </div>
            <input
              type="text"
              name="experience"
              placeholder={t('experience')}
              value={formData.experience}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              type="password"
              name="password"
              placeholder={t('password')}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? t('signingUp') : t('submit')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('alreadyHaveAccount')}{' '}
            <a href="/signin" className="link-button">{t('signIn')}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpProvider;
