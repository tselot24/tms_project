import React from 'react';
import { Navigate } from 'react-router-dom';

// ProtectedRoute: checks if user is authenticated

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    // Redirect to the correct login route
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
