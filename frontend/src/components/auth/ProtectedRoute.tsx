import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullHeight message="Verificando autenticação..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}