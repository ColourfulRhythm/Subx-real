import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Developers from './pages/Developers';
import Projects from './pages/Projects';
import Login from './pages/Login';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Box sx={{ display: 'flex' }}>
            <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                mt: 8,
                backgroundColor: (theme) => theme.palette.background.default,
                minHeight: '100vh',
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/developers" element={<Developers />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
