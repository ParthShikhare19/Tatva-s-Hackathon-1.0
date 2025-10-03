import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { FaHandshake, FaUser, FaTools, FaGlobe } from 'react-icons/fa';
import '../styles/Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  useEffect(() => {
    const hasSelectedLanguage = localStorage.getItem('preferredLanguage');
    if (!hasSelectedLanguage) {
      setShowLanguageSelector(true);
    }
  }, []);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setShowLanguageSelector(false);
  };

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
  ];

  if (showLanguageSelector) {
    return (
      <div className="landing-page">
        <div className="language-selection-modal">
          <div className="language-modal-content">
            <div className="language-modal-icon">
              <FaGlobe />
            </div>
            <h2 className="language-modal-title">Select Your Language</h2>
            <p className="language-modal-subtitle">Choose your preferred language to continue</p>
            
            <div className="language-options">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className="language-option-button"
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <span className="language-name">{lang.nativeName}</span>
                  <span className="language-english">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <button 
        className="change-language-btn" 
        onClick={() => setShowLanguageSelector(true)}
        title="Change Language"
      >
        <FaGlobe /> {language.toUpperCase()}
      </button>
      
      <div className="landing-content">
        <div className="logo">
          <div className="logo-icon"><FaHandshake /></div>
          <h1>DoMyService</h1>
        </div>
        
        <p className="tagline">{t('tagline')}</p>
        
        <div className="action-cards">
          <div className="action-card customer-card" onClick={() => navigate('/signup/customer')}>
            <div className="card-icon"><FaUser /></div>
            <h2>{t('findService')}</h2>
            <p>{t('customer')}</p>
          </div>
          
          <div className="action-card provider-card" onClick={() => navigate('/signup/provider')}>
            <div className="card-icon"><FaTools /></div>
            <h2>{t('provideService')}</h2>
            <p>{t('provider')}</p>
          </div>
        </div>
        
        <div className="signin-link">
          <p>{t('alreadyHaveAccount')}</p>
          <button onClick={() => navigate('/signin')} className="link-button">
            {t('signIn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
