/**
 * Shortlist view page
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiClient, ShortlistResponse, ShortlistedRequirement } from '../context/ApiClient';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Box, Chip, Card, CardContent, Divider, TextField, MenuItem, Button } from '@mui/material';

export default function ShortlistViewPage() {
  const { id } = useParams<{ id: string }>();
  const [shortlist, setShortlist] = useState<ShortlistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchShortlist = async () => {
      try {
        const data = await ApiClient.getShortlist(id!);
        setShortlist(data);
      } catch (error) {
        console.error('Failed to fetch shortlist:', error);
        setError('Failed to fetch shortlist');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchShortlist();
    }
  }, [id]);

  const getStatusChip = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'inProgress':
        return <Chip label="In Progress" color="warning" size="small" />;
      case 'notApplicable':
        return <Chip label="Not Applicable" color="info" size="small" />;
      default:
        return <Chip label="Pending" color="default" size="small" />;
    }
  };

  const getLevelChip = (level: string) => {
    switch (level) {
      case 'L1':
        return <Chip label="Level 1" color="success" size="small" />;
      case 'L2':
        return <Chip label="Level 2" color="warning" size="small" />;
      case 'L3':
        return <Chip label="Level 3" color="error" size="small" />;
      default:
        return <Chip label={level} size="small" />;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !shortlist) {
    return (
      <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="error">
          {error || 'Shortlist not found'}
        </Typography>
      </Paper>
    );
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <div>
          <Typography variant="h4" gutterBottom>
            Security Requirements Shortlist
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generated: {new Date(shortlist.generated_at).toLocaleString()} • Version: {shortlist.version}
          </Typography>
        </div>
        <Button variant="outlined">Export to JSON</Button>
      </Box>
      
      <Card sx={{ marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h6">Summary</Typography>
          <Typography variant="body2">
            {shortlist.requirements.length} requirements generated from your questionnaire answers
          </Typography>
        </CardContent>
      </Card>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shortlist.requirements.map((requirement, index) => (
              <TableRow key={requirement.id}>
                <TableCell>{requirement.requirementId}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {requirement.title}
                  </Typography>
                </TableCell>
                <TableCell>{getLevelChip(requirement.level)}</TableCell>
                <TableCell>{requirement.category}</TableCell>
                <TableCell>{getStatusChip(requirement.status)}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => alert(`View details for ${requirement.title}`)}>
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Requirement Details
        </Typography>
        
        {shortlist.requirements.map((requirement, index) => (
          <Card key={requirement.id} sx={{ marginBottom: 2 }}>
            <CardContent>
              <Typography variant="h6">{requirement.requirementId}: {requirement.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', gap: 1, marginBottom: 2 }}>
                {getLevelChip(requirement.level)}
                <Chip label={requirement.standard.toUpperCase()} size="small" />
                <Chip label={requirement.category} size="small" />
              </Typography>
              
              <Divider sx={{ marginY: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Description</Typography>
              <Typography variant="body2" paragraph>
                {requirement.description}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>Rationale</Typography>
              <Typography variant="body2" paragraph>
                {requirement.rationale}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                <TextField
                  select
                  label="Status"
                  size="small"
                  value={requirement.status || 'pending'}
                  onChange={(e) => {
                    // In a real implementation, this would update the status via API
                    console.log('Status changed to:', e.target.value);
                  }}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inProgress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="notApplicable">Not Applicable</MenuItem>
                </TextField>
                
                <TextField
                  label="Assignee"
                  size="small"
                  value={requirement.assignee || ''}
                  onChange={(e) => {
                    // In a real implementation, this would update the assignee via API
                    console.log('Assignee changed to:', e.target.value);
                  }}
                  sx={{ minWidth: 200 }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </div>
  );
}
