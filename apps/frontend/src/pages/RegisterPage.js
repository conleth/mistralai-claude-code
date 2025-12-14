import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Register page
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, TextField, Typography, Container, Box, Alert, Paper, MenuItem } from '@mui/material';
export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('developer');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(name, email, password, role);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(Container, { maxWidth: "sm", children: _jsxs(Paper, { elevation: 3, sx: { padding: 4, marginTop: 8 }, children: [_jsx(Typography, { variant: "h4", component: "h1", gutterBottom: true, children: "Register for Security RAT Modern" }), error && (_jsx(Alert, { severity: "error", sx: { marginBottom: 2 }, children: error })), _jsxs(Box, { component: "form", onSubmit: handleSubmit, children: [_jsx(TextField, { label: "Name", fullWidth: true, margin: "normal", value: name, onChange: (e) => setName(e.target.value), required: true, autoFocus: true }), _jsx(TextField, { label: "Email", type: "email", fullWidth: true, margin: "normal", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx(TextField, { label: "Password", type: "password", fullWidth: true, margin: "normal", value: password, onChange: (e) => setPassword(e.target.value), required: true, helperText: "Minimum 8 characters" }), _jsxs(TextField, { label: "Role", select: true, fullWidth: true, margin: "normal", value: role, onChange: (e) => setRole(e.target.value), required: true, children: [_jsx(MenuItem, { value: "security-lead", children: "Security Lead" }), _jsx(MenuItem, { value: "developer", children: "Developer" }), _jsx(MenuItem, { value: "product-manager", children: "Product Manager" }), _jsx(MenuItem, { value: "auditor", children: "Auditor" })] }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", size: "large", sx: { marginTop: 3, marginBottom: 2 }, disabled: isLoading, children: isLoading ? 'Registering...' : 'Register' }), _jsxs(Typography, { variant: "body2", align: "center", children: ["Already have an account? ", _jsx(Link, { to: "/login", children: "Login" })] })] })] }) }));
}
//# sourceMappingURL=RegisterPage.js.map