import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Common/Loading';

export function PrivateRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Validando credenciais de acesso..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // Usuário autenticado mas sem permissão administrativa
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;
