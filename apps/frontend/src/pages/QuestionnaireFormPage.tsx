/**
 * Questionnaire form page
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiClient } from '../context/ApiClient';
import { Button, Typography, Paper, TextField, MenuItem, Box, CircularProgress, Alert, Stepper, Step, StepLabel } from '@mui/material';
import { MINIMUM_QUESTIONNAIRE } from '@security-rat/questionnaire';

export default function QuestionnaireFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
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
          const newQuestionnaire = await ApiClient.createQuestionnaire(
            questionnaire.name,
            questionnaire.description
          );
          
          setQuestionnaireId(newQuestionnaire.id);
        } else {
          // Create new questionnaire
          const newQuestionnaire = await ApiClient.createQuestionnaire(
            'New Questionnaire',
            'Created on ' + new Date().toLocaleDateString()
          );
          
          setQuestionnaireId(newQuestionnaire.id);
        }
      } catch (error) {
        console.error('Failed to initialize questionnaire:', error);
        setError('Failed to initialize questionnaire');
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [id]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!questionnaireId) return;
    
    try {
      const response = await ApiClient.createQuestionnaireAnswers(
        questionnaireId,
        answers,
        '1.0'
      );
      
      // Generate shortlist
      const shortlistResponse = await ApiClient.generateShortlist(response.id);
      
      setSuccess('Questionnaire submitted and shortlist generated!');
      
      // Navigate to shortlist view after a delay
      setTimeout(() => {
        navigate(`/shortlist/${shortlistResponse.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit questionnaire:', error);
      setError('Failed to submit questionnaire');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {id ? 'Update Questionnaire' : 'Create New Questionnaire'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ marginBottom: 2 }}>
          {success}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stepper activeStep={0} alternativeLabel>
            <Step><StepLabel>Application Profile</StepLabel></Step>
          </Stepper>
          
          <Box sx={{ marginTop: 3 }}>
            {MINIMUM_QUESTIONNAIRE.map((question) => (
              <Box key={question.id} sx={{ marginBottom: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {question.text}
                </Typography>
                
                {question.type === 'select' ? (
                  <TextField
                    select
                    fullWidth
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    required
                  >
                    {question.options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    fullWidth
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    required
                  />
                )}
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={Object.keys(answers).length === 0}
            >
              Generate Shortlist
            </Button>
          </Box>
        </Box>
      </Paper>
    </div>
  );
}
