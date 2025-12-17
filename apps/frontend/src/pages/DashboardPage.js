import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Dashboard page
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiClient } from '../context/ApiClient';
import { Button, Typography, Grid, Card, CardContent, CardActions, Paper, CircularProgress, Box } from '@mui/material';
export default function DashboardPage() {
    const { user } = useAuth();
    const [questionnaires, setQuestionnaires] = useState([]);
    const [shortlists, setShortlists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [questionnaireData, shortlistData] = await Promise.all([
                    ApiClient.getQuestionnaireAnswers(),
                    // In a real implementation, we'd fetch shortlists
                    Promise.resolve([]),
                ]);
                setQuestionnaires(questionnaireData);
                setShortlists(shortlistData);
            }
            catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    if (isLoading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs("div", { children: [_jsxs(Typography, { variant: "h4", gutterBottom: true, children: ["Welcome, ", user?.name, "!"] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Paper, { elevation: 3, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Your Questionnaires" }), questionnaires.length === 0 ? (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "No questionnaires yet. Create one to get started!" })) : (_jsx("div", { children: questionnaires.map((qa) => (_jsxs(Card, { variant: "outlined", sx: { marginBottom: 2 }, children: [_jsxs(CardContent, { children: [_jsx(Typography, { variant: "subtitle1", children: qa.questionnaire_name }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Version: ", qa.version, " \u2022 ", new Date(qa.created_at).toLocaleDateString()] })] }), _jsx(CardActions, { children: _jsx(Button, { size: "small", onClick: () => navigate(`/shortlist/${qa.id}`), children: "View Shortlist" }) })] }, qa.id))) }))] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Paper, { elevation: 3, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Quick Actions" }), _jsx(Button, { variant: "contained", fullWidth: true, size: "large", sx: { marginBottom: 2 }, onClick: () => navigate('/questionnaires/new'), children: "Create New Questionnaire" }), _jsx(Button, { variant: "outlined", fullWidth: true, size: "large", onClick: () => navigate('/questionnaires'), children: "Manage Questionnaires" })] }) }) })] })] }));
}
//# sourceMappingURL=DashboardPage.js.map