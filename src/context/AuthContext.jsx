import { createContext, useState } from 'react';
import * as Sentry from '@sentry/react';
import { isAdminOrAbove, isSuperAdmin as isSuperAdminFn, isStaff as isStaffFn, ROLES } from '../utils/roles';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const userData = JSON.parse(stored);
            Sentry.setUser({ id: String(userData.id) });
            return userData;
        }
        return null;
    });

    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [cartCount, setCartCount] = useState(0);
    const [favoriteCount, setFavoriteCount] = useState(0);

    const loginUser = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', jwtToken);
        Sentry.setUser({ id: String(userData.id) });
    };

    const logoutUser = () => {
        setUser(null);
        setToken(null);
        setCartCount(0);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        Sentry.setUser(null);
    };

    // "ADMIN and above" — includes SUPER_ADMIN. Use isStaff() for "any admin-panel user".
    const isAdmin = () => isAdminOrAbove(user);
    const isSuperAdmin = () => isSuperAdminFn(user);
    const isStaff = () => isStaffFn(user);
    const isEmployee = () => user?.role === ROLES.EMPLOYEE;
    const isAuthenticated = () => !!token;

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loginUser,
            logoutUser,
            isAdmin,
            isSuperAdmin,
            isStaff,
            isEmployee,
            isAuthenticated,
            cartCount,
            setCartCount,
            favoriteCount,
            setFavoriteCount
        }}>
            {children}
        </AuthContext.Provider>
    );
};