import { createContext, useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import axiosInstance from '../api/axiosInstance';
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

    const persistUser = (next) => {
        if (next) localStorage.setItem('user', JSON.stringify(next));
        return next;
    };

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

    // Called after a successful forced password change. The backend returns a fresh
    // token whose "must change password" claim is cleared — swap it in, otherwise the
    // next request goes out with the old token and the user is bounced to login.
    const completeForcedPasswordChange = (newToken) => {
        setUser(prev => (prev ? persistUser({ ...prev, passwordChangeRequired: false }) : prev));
        if (newToken) {
            setToken(newToken);
            localStorage.setItem('token', newToken);
        }
    };

    // Re-sync the current user on load. This keeps `passwordChangeRequired` correct
    // across a page refresh (F5) and picks up the flag when it was raised in another
    // session — e.g. a SUPER_ADMIN reset this user's password while they were idle.
    useEffect(() => {
        if (!localStorage.getItem('token')) return;
        let cancelled = false;
        axiosInstance.get('/auth/me')
            .then(({ data }) => {
                if (cancelled || !data) return;
                setUser(prev => persistUser({ ...(prev || {}), ...data }));
                if (data.id) Sentry.setUser({ id: String(data.id) });
            })
            .catch(() => { /* 401 is handled by the interceptor; ignore the rest */ });
        return () => { cancelled = true; };
    }, []);

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
            completeForcedPasswordChange,
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
