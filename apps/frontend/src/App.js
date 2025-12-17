import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Main application component
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuestionnaireListPage from './pages/QuestionnaireListPage';
import QuestionnaireFormPage from './pages/QuestionnaireFormPage';
import ShortlistViewPage from './pages/ShortlistViewPage';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
});
function AppContent() {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return (_jsxs("div", { style: { padding: '2rem', fontFamily: 'system-ui, sans-serif' }, children: [_jsx("h1", { children: "Security RAT Modern" }), _jsx("p", { children: "Loading..." })] }));
    }
    return (_jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsxs(Router, { children: [_jsx(Navbar, {}), _jsx("div", { style: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsxs(Route, { path: "", element: _jsx(PrivateRoute, {}), children: [_jsx(Route, { path: "dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "questionnaires", element: _jsx(QuestionnaireListPage, {}) }), _jsx(Route, { path: "questionnaires/new", element: _jsx(QuestionnaireFormPage, {}) }), _jsx(Route, { path: "questionnaires/:id/answers", element: _jsx(QuestionnaireFormPage, {}) }), _jsx(Route, { path: "shortlist/:id", element: _jsx(ShortlistViewPage, {}) }), _jsx(Route, { path: "", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }) })] })] }));
}
function App() {
    return (_jsx(AuthProvider, { children: _jsx(AppContent, {}) }));
}
export default App;
//# sourceMappingURL=App.js.map