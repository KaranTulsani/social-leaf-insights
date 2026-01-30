import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show nothing while loading auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to sign in
  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Authenticated but no plan selected - redirect to plan selection
  // Skip this check if already on choose-plan or payment page
  if (
    profile &&
    !profile.plan &&
    location.pathname !== '/choose-plan' &&
    location.pathname !== '/payment'
  ) {
    return <Navigate to="/choose-plan" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
