import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getProjects, getDevelopers, createProject, updateProject, deleteProject } from '../services/api';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    developer: '',
    status: 'pending',
    startDate: '',
    endDate: '',
    budget: '',
  });
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [projectsRes, developersRes] = await Promise.all([
        getProjects(),
        getDevelopers(),
      ]);
      
      // Ensure we have arrays even if the API returns an error
      const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : [];
      const developersData = Array.isArray(developersRes.data) ? developersRes.data : [];
      
      setProjects(projectsData);
      setDevelopers(developersData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
      setProjects([]);
      setDevelopers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (project = null) => {
    if (project) {
      setSelectedProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        developer: project.developer,
        status: project.status,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        budget: project.budget || '',
      });
    } else {
      setSelectedProject(null);
      setFormData({
        title: '',
        description: '',
        developer: '',
        status: 'pending',
        startDate: '',
        endDate: '',
        budget: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
    setFormData({
      title: '',
      description: '',
      developer: '',
      status: 'pending',
      startDate: '',
      endDate: '',
      budget: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProject) {
        await updateProject(selectedProject._id, formData);
      } else {
        await createProject(formData);
      }
      handleCloseDialog();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          Projects Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            py: 1,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          Add Project
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer 
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          '& .MuiTableHead-root': {
            backgroundColor: theme.palette.primary.main,
            '& .MuiTableCell-root': {
              color: 'white',
              fontWeight: 'bold',
            },
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Developer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project._id}>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {project.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  {developers.find(d => d._id === project.developer)?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={project.status}
                    color={
                      project.status === 'completed' ? 'success' :
                      project.status === 'in-progress' ? 'primary' :
                      project.status === 'cancelled' ? 'error' : 'warning'
                    }
                    size="small"
                    sx={{ borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {project.budget ? (
                    <Typography sx={{ fontWeight: 500, color: theme.palette.success.main }}>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(project.budget)}
                    </Typography>
                  ) : 'N/A'}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => handleOpenDialog(project)}
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(project._id)}
                    sx={{
                      color: theme.palette.error.main,
                      '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 4,
          },
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 'bold',
        }}>
          {selectedProject ? 'Edit Project' : 'Add Project'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
              <InputLabel>Developer</InputLabel>
              <Select
                name="developer"
                value={formData.developer}
                onChange={handleChange}
                required
              >
                {developers.map((developer) => (
                  <MenuItem key={developer._id} value={developer._id}>
                    {developer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Budget"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': { backgroundColor: alpha(theme.palette.text.secondary, 0.04) },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              px: 3,
            }}
          >
            {selectedProject ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Projects; 