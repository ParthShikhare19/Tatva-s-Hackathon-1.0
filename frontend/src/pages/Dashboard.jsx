import { useLanguage } from '../contexts/LanguageContext';
import { FaRocket } from 'react-icons/fa';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>{t('dashboard')}</h1>
        <div className="coming-soon">
          <div className="coming-soon-icon"><FaRocket /></div>
          <p>{t('comingSoon')}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
