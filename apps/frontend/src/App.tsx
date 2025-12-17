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
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <h1>Security RAT Modern</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="" element={<PrivateRoute />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="questionnaires" element={<QuestionnaireListPage />} />
              <Route path="questionnaires/new" element={<QuestionnaireFormPage />} />
              <Route path="questionnaires/:id/answers" element={<QuestionnaireFormPage />} />
              <Route path="shortlist/:id" element={<ShortlistViewPage />} />
              <Route path="" element={<Navigate to="/dashboard" replace />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
