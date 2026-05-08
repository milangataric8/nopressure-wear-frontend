import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [cartCount, setCartCount] = useState(0);

    const loginUser = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', jwtToken);
    };

    const logoutUser = () => {
        setUser(null);
        setToken(null);
        setCartCount(0);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const isAdmin = () => user?.role === 'ADMIN';
    const isAuthenticated = () => !!token;

    return (
        <AuthContext.Provider value={{
            user, token, loginUser, logoutUser,
            isAdmin, isAuthenticated,
            cartCount, setCartCount
        }}>
            {children}
        </AuthContext.Provider>
    );
};