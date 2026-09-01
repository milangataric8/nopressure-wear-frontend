import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

// Plain authentication gate. Role-based access uses RoleRoute (src/utils/roles.js).
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
