import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { FaHandshake, FaEnvelope, FaLock } from 'react-icons/fa';
import '../styles/Auth.css';

const SignIn = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    emailOrMobile: '',
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
          <div className="logo-icon"><FaHandshake /></div>
          <h1>{t('signIn')}</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-icon"><FaEnvelope /></div>
            <input
              type="text"
              placeholder={`${t('email')} / ${t('mobile')}`}
              value={formData.emailOrMobile}
              onChange={(e) => setFormData({...formData, emailOrMobile: e.target.value})}
              required
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
            {t('signIn')} →
          </button>
        </form>
        
        <div className="auth-footer">
          <p>{t('dontHaveAccount')}</p>
          <button onClick={() => navigate('/')} className="link-button">
            {t('signUp')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
