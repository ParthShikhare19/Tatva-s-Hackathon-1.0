import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { FaHandshake, FaEnvelope, FaLock } from 'react-icons/fa';
import '../styles/Auth.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

const SignIn = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    emailOrMobile: '',
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.emailOrMobile,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      localStorage.setItem('authToken', data.access_token);
      navigate('/dashboard');

    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo-icon">
            <FaHandshake />
          </div>
          <h1>{t('signIn')}</h1>
        </div>

        <LanguageSwitcher />

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <div className="input-icon">
              <FaEnvelope />
            </div>
            <input
              type="text"
              name="emailOrMobile"
              placeholder={t('emailOrMobile')}
              value={formData.emailOrMobile}
              onChange={handleChange}
              required
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
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('dontHaveAccount')}{' '}
            <a href="/signup/customer" className="link-button">{t('signUp')}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
