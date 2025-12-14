import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Login page
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, TextField, Typography, Container, Box, Alert, Paper } from '@mui/material';
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(Container, { maxWidth: "sm", children: _jsxs(Paper, { elevation: 3, sx: { padding: 4, marginTop: 8 }, children: [_jsx(Typography, { variant: "h4", component: "h1", gutterBottom: true, children: "Login to Security RAT Modern" }), error && (_jsx(Alert, { severity: "error", sx: { marginBottom: 2 }, children: error })), _jsxs(Box, { component: "form", onSubmit: handleSubmit, children: [_jsx(TextField, { label: "Email", type: "email", fullWidth: true, margin: "normal", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoFocus: true }), _jsx(TextField, { label: "Password", type: "password", fullWidth: true, margin: "normal", value: password, onChange: (e) => setPassword(e.target.value), required: true }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", size: "large", sx: { marginTop: 3, marginBottom: 2 }, disabled: isLoading, children: isLoading ? 'Logging in...' : 'Login' }), _jsxs(Typography, { variant: "body2", align: "center", children: ["Don't have an account? ", _jsx(Link, { to: "/register", children: "Register" })] })] })] }) }));
}
//# sourceMappingURL=LoginPage.js.map