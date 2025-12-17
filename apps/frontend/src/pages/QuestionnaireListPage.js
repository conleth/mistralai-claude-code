import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Questionnaire list page
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../context/ApiClient';
import { Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Box, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
export default function QuestionnaireListPage() {
    const [questionnaires, setQuestionnaires] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchQuestionnaires = async () => {
            try {
                const data = await ApiClient.getQuestionnaires();
                setQuestionnaires(data);
            }
            catch (error) {
                console.error('Failed to fetch questionnaires:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchQuestionnaires();
    }, []);
    const handleCreate = () => {
        navigate('/questionnaires/new');
    };
    const handleEdit = (id) => {
        navigate(`/questionnaires/${id}/answers`);
    };
    if (isLoading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs("div", { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "Questionnaires" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: handleCreate, children: "New Questionnaire" })] }), questionnaires.length === 0 ? (_jsx(Paper, { elevation: 3, sx: { padding: 3, textAlign: 'center' }, children: _jsx(Typography, { variant: "body1", color: "text.secondary", children: "No questionnaires yet. Create one to get started!" }) })) : (_jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Name" }), _jsx(TableCell, { children: "Description" }), _jsx(TableCell, { children: "Created" }), _jsx(TableCell, { children: "Actions" })] }) }), _jsx(TableBody, { children: questionnaires.map((questionnaire) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: questionnaire.name }), _jsx(TableCell, { children: questionnaire.description || '-' }), _jsx(TableCell, { children: new Date(questionnaire.created_at).toLocaleDateString() }), _jsxs(TableCell, { children: [_jsx(IconButton, { onClick: () => handleEdit(questionnaire.id), children: _jsx(Edit, { fontSize: "small" }) }), _jsx(IconButton, { color: "error", children: _jsx(Delete, { fontSize: "small" }) })] })] }, questionnaire.id))) })] }) }))] }));
}
//# sourceMappingURL=QuestionnaireListPage.js.map