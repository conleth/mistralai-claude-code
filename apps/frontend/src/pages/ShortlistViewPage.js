import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Shortlist view page
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiClient } from '../context/ApiClient';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Box, Chip, Card, CardContent, Divider, TextField, MenuItem, Button } from '@mui/material';
export default function ShortlistViewPage() {
    const { id } = useParams();
    const [shortlist, setShortlist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchShortlist = async () => {
            try {
                const data = await ApiClient.getShortlist(id);
                setShortlist(data);
            }
            catch (error) {
                console.error('Failed to fetch shortlist:', error);
                setError('Failed to fetch shortlist');
            }
            finally {
                setIsLoading(false);
            }
        };
        if (id) {
            fetchShortlist();
        }
    }, [id]);
    const getStatusChip = (status) => {
        switch (status) {
            case 'completed':
                return _jsx(Chip, { label: "Completed", color: "success", size: "small" });
            case 'inProgress':
                return _jsx(Chip, { label: "In Progress", color: "warning", size: "small" });
            case 'notApplicable':
                return _jsx(Chip, { label: "Not Applicable", color: "info", size: "small" });
            default:
                return _jsx(Chip, { label: "Pending", color: "default", size: "small" });
        }
    };
    const getLevelChip = (level) => {
        switch (level) {
            case 'L1':
                return _jsx(Chip, { label: "Level 1", color: "success", size: "small" });
            case 'L2':
                return _jsx(Chip, { label: "Level 2", color: "warning", size: "small" });
            case 'L3':
                return _jsx(Chip, { label: "Level 3", color: "error", size: "small" });
            default:
                return _jsx(Chip, { label: level, size: "small" });
        }
    };
    if (isLoading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", children: _jsx(CircularProgress, {}) }));
    }
    if (error || !shortlist) {
        return (_jsx(Paper, { elevation: 3, sx: { padding: 3, textAlign: 'center' }, children: _jsx(Typography, { variant: "body1", color: "error", children: error || 'Shortlist not found' }) }));
    }
    return (_jsxs("div", { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [_jsxs("div", { children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "Security Requirements Shortlist" }), _jsxs(Typography, { variant: "body1", color: "text.secondary", children: ["Generated: ", new Date(shortlist.generated_at).toLocaleString(), " \u2022 Version: ", shortlist.version] })] }), _jsx(Button, { variant: "outlined", children: "Export to JSON" })] }), _jsx(Card, { sx: { marginBottom: 3 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", children: "Summary" }), _jsxs(Typography, { variant: "body2", children: [shortlist.requirements.length, " requirements generated from your questionnaire answers"] })] }) }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: "Title" }), _jsx(TableCell, { children: "Level" }), _jsx(TableCell, { children: "Category" }), _jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "Actions" })] }) }), _jsx(TableBody, { children: shortlist.requirements.map((requirement, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: requirement.requirementId }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", noWrap: true, children: requirement.title }) }), _jsx(TableCell, { children: getLevelChip(requirement.level) }), _jsx(TableCell, { children: requirement.category }), _jsx(TableCell, { children: getStatusChip(requirement.status) }), _jsx(TableCell, { children: _jsx(Button, { size: "small", onClick: () => alert(`View details for ${requirement.title}`), children: "Details" }) })] }, requirement.id))) })] }) }), _jsxs(Box, { mt: 4, children: [_jsx(Typography, { variant: "h5", gutterBottom: true, children: "Requirement Details" }), shortlist.requirements.map((requirement, index) => (_jsx(Card, { sx: { marginBottom: 2 }, children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", children: [requirement.requirementId, ": ", requirement.title] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { display: 'flex', gap: 1, marginBottom: 2 }, children: [getLevelChip(requirement.level), _jsx(Chip, { label: requirement.standard.toUpperCase(), size: "small" }), _jsx(Chip, { label: requirement.category, size: "small" })] }), _jsx(Divider, { sx: { marginY: 2 } }), _jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Description" }), _jsx(Typography, { variant: "body2", paragraph: true, children: requirement.description }), _jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Rationale" }), _jsx(Typography, { variant: "body2", paragraph: true, children: requirement.rationale }), _jsxs(Box, { sx: { display: 'flex', gap: 2, marginTop: 2 }, children: [_jsxs(TextField, { select: true, label: "Status", size: "small", value: requirement.status || 'pending', onChange: (e) => {
                                                // In a real implementation, this would update the status via API
                                                console.log('Status changed to:', e.target.value);
                                            }, sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "pending", children: "Pending" }), _jsx(MenuItem, { value: "inProgress", children: "In Progress" }), _jsx(MenuItem, { value: "completed", children: "Completed" }), _jsx(MenuItem, { value: "notApplicable", children: "Not Applicable" })] }), _jsx(TextField, { label: "Assignee", size: "small", value: requirement.assignee || '', onChange: (e) => {
                                                // In a real implementation, this would update the assignee via API
                                                console.log('Assignee changed to:', e.target.value);
                                            }, sx: { minWidth: 200 } })] })] }) }, requirement.id)))] })] }));
}
//# sourceMappingURL=ShortlistViewPage.js.map