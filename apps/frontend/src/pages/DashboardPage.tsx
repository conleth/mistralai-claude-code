/**
 * Dashboard page
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiClient, QuestionnaireAnswers, ShortlistResponse } from '../context/ApiClient';
import { Button, Typography, Grid, Card, CardContent, CardActions, Paper, CircularProgress, Box } from '@mui/material';

export default function DashboardPage() {
  const { user } = useAuth();
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireAnswers[]>([]);
  const [shortlists, setShortlists] = useState<ShortlistResponse[]>([]);
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
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
        Welcome, {user?.name}!
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Questionnaires
              </Typography>
              
              {questionnaires.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No questionnaires yet. Create one to get started!
                </Typography>
              ) : (
                <div>
                  {questionnaires.map((qa) => (
                    <Card key={qa.id} variant="outlined" sx={{ marginBottom: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1">{qa.questionnaire_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Version: {qa.version} • {new Date(qa.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => navigate(`/shortlist/${qa.id}`)}>
                          View Shortlist
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ marginBottom: 2 }}
                onClick={() => navigate('/questionnaires/new')}
              >
                Create New Questionnaire
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => navigate('/questionnaires')}
              >
                Manage Questionnaires
              </Button>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
