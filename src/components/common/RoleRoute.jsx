import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

// Route guard that takes a capability predicate from src/utils/roles.js.
// Not a security boundary — the backend enforces the same rules — but it keeps
// users out of pages they'd only get a 403 from, and off endpoints they can't call.
const RoleRoute = ({ allow, children }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    if (!allow(user)) return <Navigate to="/admin/forbidden" replace />;

    return children;
};

export default RoleRoute;
