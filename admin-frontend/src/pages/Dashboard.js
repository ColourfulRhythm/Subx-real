import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { getDevelopers, getProjects } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    totalProjects: 0,
    activeDevelopers: 0,
    completedProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [developers, projects] = await Promise.all([
          getDevelopers(),
          getProjects(),
        ]);

        const activeDevelopers = developers.filter(dev => dev.isActive).length;
        const completedProjects = projects.filter(proj => proj.status === 'completed').length;

        setStats({
          totalDevelopers: developers.length,
          totalProjects: projects.length,
          activeDevelopers,
          completedProjects,
        });
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  const StatCard = ({ title, value, color }) => (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: 140,
        bgcolor: color || 'primary.light',
        color: 'white',
      }}
    >
      <Typography component="h2" variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography component="p" variant="h4">
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Developers"
            value={stats.totalDevelopers}
            color="primary.light"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Developers"
            value={stats.activeDevelopers}
            color="success.light"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            color="info.light"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Projects"
            value={stats.completedProjects}
            color="warning.light"
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 