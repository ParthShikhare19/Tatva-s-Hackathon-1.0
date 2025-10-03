import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUpCustomer from './pages/SignUpCustomer';
import SignUpProvider from './pages/SignUpProvider';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup/customer" element={<SignUpCustomer />} />
          <Route path="/signup/provider" element={<SignUpProvider />} />
          
          {/* Protected Dashboard Route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
