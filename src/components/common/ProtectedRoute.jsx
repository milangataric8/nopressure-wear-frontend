import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const ProtectedRoute = ({ children, adminOnly = false, employeeAllowed = false }) => {
    const { isAuthenticated, isAdmin, isEmployee } = useAuth();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin() && employeeAllowed && !isEmployee()) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;