import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { getDevelopers, getProjects } from '../services/api';

function Dashboard() {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    totalProjects: 0,
    activeDevelopers: 0,
    completedProjects: 0,
    totalInvestment: 0,
    averageProjectValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [developersRes, projectsRes] = await Promise.all([
          getDevelopers(),
          getProjects(),
        ]);

        const developers = Array.isArray(developersRes.data) ? developersRes.data : [];
        const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];

        const activeDevelopers = developers.filter(dev => dev.isSubscribed).length;
        const completedProjects = projects.filter(proj => proj.status === 'completed').length;
        const totalInvestment = projects.reduce((sum, proj) => sum + (proj.budget || 0), 0);
        const averageProjectValue = projects.length ? totalInvestment / projects.length : 0;

        setStats({
          totalDevelopers: developers.length,
          totalProjects: projects.length,
          activeDevelopers,
          completedProjects,
          totalInvestment: totalInvestment.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
          averageProjectValue: averageProjectValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: 160,
        bgcolor: alpha(color || theme.palette.primary.main, 0.1),
        color: color || theme.palette.primary.main,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Icon sx={{ fontSize: 32, mr: 1 }} />
        <Typography component="h2" variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography component="p" variant="h4" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
        Dashboard Overview
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Developers"
            value={stats.totalDevelopers}
            icon={PeopleIcon}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Developers"
            value={stats.activeDevelopers}
            icon={TrendingUpIcon}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={AssignmentIcon}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Completed Projects"
            value={stats.completedProjects}
            icon={CheckCircleIcon}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Investment"
            value={stats.totalInvestment}
            icon={AttachMoneyIcon}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Average Project Value"
            value={stats.averageProjectValue}
            icon={AssessmentIcon}
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 