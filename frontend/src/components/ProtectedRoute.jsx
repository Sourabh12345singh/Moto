import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions if specified
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-200">
        <div className="text-center p-8 bg-neutral-50 dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-neutral-600 dark:text-slate-400 mb-4 font-medium">You don't have permission to access this page.</p>
          <p className="text-sm text-neutral-400 dark:text-slate-500">
            Required role: {allowedRoles.join(' or ')} | Your role: {user?.role}
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
