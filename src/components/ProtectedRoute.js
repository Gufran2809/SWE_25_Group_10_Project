import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  console.log('ProtectedRoute: user=', user, 'loading=', loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('No user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('User authenticated, rendering children');
  return children;
};

export default ProtectedRoute;