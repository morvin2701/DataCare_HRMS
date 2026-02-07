import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

const PERMANENT_ADMINS = ['morvin27@gmail.com', 'vekariyamorvin@gmail.com'];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage on mount
        const savedUser = localStorage.getItem('hrms_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // Enforce permanent admin access
        if (PERMANENT_ADMINS.includes(userData.email)) {
            userData.role = 'admin';
        }
        setUser(userData);
        localStorage.setItem('hrms_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hrms_user');
    };

    const isAdmin = () => {
        return user?.role === 'admin' || PERMANENT_ADMINS.includes(user?.email);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
