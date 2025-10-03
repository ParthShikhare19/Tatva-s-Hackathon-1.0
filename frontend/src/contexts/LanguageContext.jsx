import { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    welcome: 'Welcome to DoMyService',
    tagline: 'Connecting Communities, Building Trust',
    selectLanguage: 'Select Your Language',
    languagePrompt: 'Choose your preferred language to continue',
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
    emailOrMobile: 'Enter your Email ID or Mobile Number',
    // Dashboard translations
    welcomeBack: 'Welcome Back',
    searchServices: 'Search Services',
    searchPlaceholder: 'Search for services...',
    browseCategories: 'Browse Categories',
    nearbyProviders: 'Nearby Service Providers',
    myBookings: 'My Bookings',
    favorites: 'Favorites',
    profile: 'Profile',
    logout: 'Logout',
    viewAll: 'View All',
    // Provider Dashboard
    myServices: 'My Services',
    serviceRequests: 'Service Requests',
    earnings: 'Earnings',
    reviews: 'Reviews',
    addService: 'Add Service',
    totalEarnings: 'Total Earnings',
    pendingRequests: 'Pending Requests',
    completedJobs: 'Completed Jobs',
    averageRating: 'Average Rating',
    // Customer Dashboard
    findServices: 'Find Services',
    activeBookings: 'Active Bookings',
    bookingHistory: 'Booking History',
    savedProviders: 'Saved Providers',
    // Common
    noDataYet: 'No data yet',
    getStarted: 'Get Started',
  },
  hi: {
    welcome: 'DoMyService में आपका स्वागत है',
    tagline: 'समुदायों को जोड़ना, विश्वास बनाना',
    selectLanguage: 'अपनी भाषा चुनें',
    languagePrompt: 'जारी रखने के लिए अपनी पसंदीदा भाषा चुनें',
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
    emailOrMobile: 'अपना ईमेल आईडी या मोबाइल नंबर दर्ज करें',
    // Dashboard translations
    welcomeBack: 'वापस स्वागत है',
    searchServices: 'सेवाएं खोजें',
    searchPlaceholder: 'सेवाओं की खोज करें...',
    browseCategories: 'श्रेणियां देखें',
    nearbyProviders: 'आस-पास सेवा प्रदाता',
    myBookings: 'मेरी बुकिंग',
    favorites: 'पसंदीदा',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉग आउट',
    viewAll: 'सभी देखें',
    myServices: 'मेरी सेवाएं',
    serviceRequests: 'सेवा अनुरोध',
    earnings: 'आय',
    reviews: 'समीक्षा',
    addService: 'सेवा जोड़ें',
    totalEarnings: 'कुल आय',
    pendingRequests: 'लंबित अनुरोध',
    completedJobs: 'पूर्ण कार्य',
    averageRating: 'औसत रेटिंग',
    findServices: 'सेवाएं खोजें',
    activeBookings: 'सक्रिय बुकिंग',
    bookingHistory: 'बुकिंग इतिहास',
    savedProviders: 'सहेजे प्रदाता',
    noDataYet: 'अभी कोई डेटा नहीं',
    getStarted: 'शुरू करें',
  },
  mr: {
    welcome: 'DoMyService मध्ये तुमचे स्वागत आहे',
    tagline: 'समुदायांना जोडणे, विश्वास निर्माण करणे',
    selectLanguage: 'तुमची भाषा निवडा',
    languagePrompt: 'सुरू ठेवण्यासाठी तुमची आवडती भाषा निवडा',
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
    emailOrMobile: 'आपला ईमेल आयडी किंवा मोबाइल नंबर प्रविष्ट करा',
    // Dashboard translations
    welcomeBack: 'परत स्वागत आहे',
    searchServices: 'सेवा शोधा',
    searchPlaceholder: 'सेवांचा शोध घ्या...',
    browseCategories: 'श्रेणिया पहा',
    nearbyProviders: 'जवळचे सेवा प्रदाते',
    myBookings: 'माझी बुकिंग',
    favorites: 'आवडते',
    profile: 'प्रोफाइल',
    logout: 'लॉग आउट',
    viewAll: 'सर्व पहा',
    myServices: 'माझ्या सेवा',
    serviceRequests: 'सेवा विनंती',
    earnings: 'उत्पन्न',
    reviews: 'पुनरावलोकने',
    addService: 'सेवा जोडा',
    totalEarnings: 'एकूण उत्पन्न',
    pendingRequests: 'प्रलंबित विनंति',
    completedJobs: 'पूर्ण कामे',
    averageRating: 'सरासरी रेटिंग',
    findServices: 'सेवा शोधा',
    activeBookings: 'सक्रिय बुकिंग',
    bookingHistory: 'बुकिंग इतिहास',
    savedProviders: 'जतन केलेले प्रदाते',
    noDataYet: 'अजून कोणताही डेटा नाही',
    getStarted: 'सुरू करा',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return savedLanguage || 'en';
  });

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

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
