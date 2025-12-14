/**
 * Questionnaire list page
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient, Questionnaire } from '../context/ApiClient';
import { Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Box, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

export default function QuestionnaireListPage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const data = await ApiClient.getQuestionnaires();
        setQuestionnaires(data);
      } catch (error) {
        console.error('Failed to fetch questionnaires:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestionnaires();
  }, []);

  const handleCreate = () => {
    navigate('/questionnaires/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/questionnaires/${id}/answers`);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Questionnaires
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
        >
          New Questionnaire
        </Button>
      </Box>
      
      {questionnaires.length === 0 ? (
        <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No questionnaires yet. Create one to get started!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questionnaires.map((questionnaire) => (
                <TableRow key={questionnaire.id}>
                  <TableCell>{questionnaire.name}</TableCell>
                  <TableCell>{questionnaire.description || '-'}</TableCell>
                  <TableCell>{new Date(questionnaire.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(questionnaire.id)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
