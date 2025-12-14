import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Navigation bar component
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsx(AppBar, { position: "static", sx: { marginBottom: 3 }, children: _jsxs(Toolbar, { children: [_jsx(Typography, { variant: "h6", component: "div", sx: { flexGrow: 1 }, children: "Security RAT Modern" }), isAuthenticated ? (_jsxs(Box, { display: "flex", gap: 2, children: [_jsx(Button, { color: "inherit", onClick: () => navigate('/dashboard'), children: "Dashboard" }), _jsx(Button, { color: "inherit", onClick: () => navigate('/questionnaires'), children: "Questionnaires" }), _jsxs(Typography, { variant: "body2", sx: { marginRight: 2 }, children: [user?.name, " (", user?.role, ")"] }), _jsx(Button, { color: "inherit", onClick: handleLogout, children: "Logout" })] })) : (_jsxs(Box, { display: "flex", gap: 2, children: [_jsx(Button, { color: "inherit", onClick: () => navigate('/login'), children: "Login" }), _jsx(Button, { color: "inherit", onClick: () => navigate('/register'), children: "Register" })] }))] }) }));
}
//# sourceMappingURL=Navbar.js.map