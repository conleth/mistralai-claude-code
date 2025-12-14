import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Questionnaire form page
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiClient } from '../context/ApiClient';
import { Button, Typography, Paper, TextField, MenuItem, Box, CircularProgress, Alert, Stepper, Step, StepLabel } from '@mui/material';
import { MINIMUM_QUESTIONNAIRE } from '@security-rat/questionnaire';
export default function QuestionnaireFormPage() {
    const { id } = useParams();
    const [questionnaireId, setQuestionnaireId] = useState(null);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        const initialize = async () => {
            try {
                if (id) {
                    // Load existing questionnaire
                    const questionnaire = await ApiClient.getQuestionnaire(id);
                    // Create a new questionnaire for answers
                    const newQuestionnaire = await ApiClient.createQuestionnaire(questionnaire.name, questionnaire.description);
                    setQuestionnaireId(newQuestionnaire.id);
                }
                else {
                    // Create new questionnaire
                    const newQuestionnaire = await ApiClient.createQuestionnaire('New Questionnaire', 'Created on ' + new Date().toLocaleDateString());
                    setQuestionnaireId(newQuestionnaire.id);
                }
            }
            catch (error) {
                console.error('Failed to initialize questionnaire:', error);
                setError('Failed to initialize questionnaire');
            }
            finally {
                setIsLoading(false);
            }
        };
        initialize();
    }, [id]);
    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!questionnaireId)
            return;
        try {
            const response = await ApiClient.createQuestionnaireAnswers(questionnaireId, answers, '1.0');
            // Generate shortlist
            const shortlistResponse = await ApiClient.generateShortlist(response.id);
            setSuccess('Questionnaire submitted and shortlist generated!');
            // Navigate to shortlist view after a delay
            setTimeout(() => {
                navigate(`/shortlist/${shortlistResponse.id}`);
            }, 2000);
        }
        catch (error) {
            console.error('Failed to submit questionnaire:', error);
            setError('Failed to submit questionnaire');
        }
    };
    if (isLoading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs("div", { children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: id ? 'Update Questionnaire' : 'Create New Questionnaire' }), error && (_jsx(Alert, { severity: "error", sx: { marginBottom: 2 }, children: error })), success && (_jsx(Alert, { severity: "success", sx: { marginBottom: 2 }, children: success })), _jsx(Paper, { elevation: 3, sx: { padding: 3 }, children: _jsxs(Box, { component: "form", onSubmit: handleSubmit, children: [_jsx(Stepper, { activeStep: 0, alternativeLabel: true, children: _jsx(Step, { children: _jsx(StepLabel, { children: "Application Profile" }) }) }), _jsx(Box, { sx: { marginTop: 3 }, children: MINIMUM_QUESTIONNAIRE.map((question) => (_jsxs(Box, { sx: { marginBottom: 3 }, children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: question.text }), question.type === 'select' ? (_jsx(TextField, { select: true, fullWidth: true, value: answers[question.id] || '', onChange: (e) => handleAnswerChange(question.id, e.target.value), required: true, children: question.options?.map((option) => (_jsx(MenuItem, { value: option.value, children: option.label }, option.value))) })) : (_jsx(TextField, { fullWidth: true, value: answers[question.id] || '', onChange: (e) => handleAnswerChange(question.id, e.target.value), required: true }))] }, question.id))) }), _jsx(Box, { sx: { display: 'flex', justifyContent: 'flex-end', marginTop: 4 }, children: _jsx(Button, { type: "submit", variant: "contained", size: "large", disabled: Object.keys(answers).length === 0, children: "Generate Shortlist" }) })] }) })] }));
}
//# sourceMappingURL=QuestionnaireFormPage.js.map