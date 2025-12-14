import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Authentication context
 */
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Check for existing token in localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
            catch (error) {
                console.error('Failed to parse stored user', error);
            }
        }
        setIsLoading(false);
    }, []);
    const login = async (email, password) => {
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
    };
    const register = async (name, email, password, role = 'developer') => {
        const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, role }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        const data = await response.json();
        // Auto-login after registration
        await login(email, password);
    };
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            token,
            login,
            register,
            logout,
            isAuthenticated: !!token,
            isLoading,
        }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
//# sourceMappingURL=AuthContext.js.map