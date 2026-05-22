import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const DashboardRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Redirection vers votre espace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Aiguillage basé sur le slug de rôle
  const roleSlug = user?.role?.slug;

  switch (roleSlug) {
    case 'directeur':
    case 'admin':
    case 'super_admin':
      return <Navigate to="/dashboard/director" replace />;
    case 'commercial':
      return <Navigate to="/dashboard/commercial" replace />;
    case 'chef_chantier':
      return <Navigate to="/dashboard/project-manager" replace />;
    case 'finance':
      return <Navigate to="/dashboard/finance" replace />;
    case 'technicien':
      return <Navigate to="/dashboard/projects" replace />;
    case 'rh':
      return <Navigate to="/dashboard/rh" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default DashboardRedirect;
