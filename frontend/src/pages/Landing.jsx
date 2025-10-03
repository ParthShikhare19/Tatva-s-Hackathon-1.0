import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { FaHandshake, FaUser, FaTools } from 'react-icons/fa';
import '../styles/Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="landing-page">
      <LanguageSwitcher />
      
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
