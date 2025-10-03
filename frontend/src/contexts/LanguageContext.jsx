import { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    welcome: 'Welcome to DoMyService',
    tagline: 'Connecting Communities, Building Trust',
    findService: 'Find a Service',
    provideService: 'Provide a Service',
    customer: 'Customer',
    provider: 'Service Provider',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    customerSignUp: 'Customer Sign Up',
    providerSignUp: 'Service Provider Sign Up',
    name: 'Name',
    location: 'Location',
    email: 'Email',
    mobile: 'Mobile Number',
    password: 'Password',
    serviceName: 'Service Name',
    serviceDescription: 'Service Description',
    experience: 'Years of Experience',
    submit: 'Submit',
    backToHome: 'Back to Home',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    dashboard: 'Dashboard',
    comingSoon: 'Coming Soon...',
  },
  hi: {
    welcome: 'DoMyService में आपका स्वागत है',
    tagline: 'समुदायों को जोड़ना, विश्वास बनाना',
    findService: 'सेवा खोजें',
    provideService: 'सेवा प्रदान करें',
    customer: 'ग्राहक',
    provider: 'सेवा प्रदाता',
    signIn: 'साइन इन करें',
    signUp: 'साइन अप करें',
    customerSignUp: 'ग्राहक साइन अप',
    providerSignUp: 'सेवा प्रदाता साइन अप',
    name: 'नाम',
    location: 'स्थान',
    email: 'ईमेल',
    mobile: 'मोबाइल नंबर',
    password: 'पासवर्ड',
    serviceName: 'सेवा का नाम',
    serviceDescription: 'सेवा का विवरण',
    experience: 'अनुभव के वर्ष',
    submit: 'जमा करें',
    backToHome: 'होम पर वापस जाएं',
    alreadyHaveAccount: 'पहले से खाता है?',
    dontHaveAccount: 'खाता नहीं है?',
    dashboard: 'डैशबोर्ड',
    comingSoon: 'जल्द आ रहा है...',
  },
  mr: {
    welcome: 'DoMyService मध्ये तुमचे स्वागत आहे',
    tagline: 'समुदायांना जोडणे, विश्वास निर्माण करणे',
    findService: 'सेवा शोधा',
    provideService: 'सेवा प्रदान करा',
    customer: 'ग्राहक',
    provider: 'सेवा प्रदाता',
    signIn: 'साइन इन करा',
    signUp: 'साइन अप करा',
    customerSignUp: 'ग्राहक साइन अप',
    providerSignUp: 'सेवा प्रदाता साइन अप',
    name: 'नाव',
    location: 'स्थान',
    email: 'ईमेल',
    mobile: 'मोबाइल नंबर',
    password: 'पासवर्ड',
    serviceName: 'सेवेचे नाव',
    serviceDescription: 'सेवेचे वर्णन',
    experience: 'अनुभवाची वर्षे',
    submit: 'सबमिट करा',
    backToHome: 'होम वर परत जा',
    alreadyHaveAccount: 'आधीच खाते आहे?',
    dontHaveAccount: 'खाते नाही आहे?',
    dashboard: 'डॅशबोर्ड',
    comingSoon: 'लवकरच येत आहे...',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
