import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Private route component
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function PrivateRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return null; // or a loading spinner
    }
    return isAuthenticated ? _jsx(Outlet, {}) : _jsx(Navigate, { to: "/login", replace: true });
}
//# sourceMappingURL=PrivateRoute.js.map