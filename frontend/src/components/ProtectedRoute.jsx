import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import ApiService from '../services/api';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = ApiService.getAuthToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userInfo = await ApiService.getCurrentUser();
        setUser(userInfo);
      } catch (error) {
        ApiService.removeAuthToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
