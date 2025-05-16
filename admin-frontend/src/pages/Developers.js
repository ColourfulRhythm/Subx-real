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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getDevelopers, createDeveloper, updateDeveloper, deleteDeveloper } from '../services/api';

function Developers() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    website: '',
    bio: '',
  });

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const data = await getDevelopers();
      setDevelopers(data);
    } catch (err) {
      setError('Failed to fetch developers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (developer = null) => {
    if (developer) {
      setSelectedDeveloper(developer);
      setFormData({
        name: developer.name,
        email: developer.email,
        company: developer.company || '',
        phone: developer.phone || '',
        website: developer.website || '',
        bio: developer.bio || '',
      });
    } else {
      setSelectedDeveloper(null);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        website: '',
        bio: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDeveloper(null);
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      website: '',
      bio: '',
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
      if (selectedDeveloper) {
        await updateDeveloper(selectedDeveloper._id, formData);
      } else {
        await createDeveloper(formData);
      }
      handleCloseDialog();
      fetchDevelopers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this developer?')) {
      try {
        await deleteDeveloper(id);
        fetchDevelopers();
      } catch (err) {
        setError('Failed to delete developer');
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
        <Typography variant="h4">Developers</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add Developer
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Website</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {developers.map((developer) => (
              <TableRow key={developer._id}>
                <TableCell>{developer.name}</TableCell>
                <TableCell>{developer.email}</TableCell>
                <TableCell>{developer.company}</TableCell>
                <TableCell>{developer.phone}</TableCell>
                <TableCell>{developer.website}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(developer)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(developer._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDeveloper ? 'Edit Developer' : 'Add Developer'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedDeveloper ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Developers; 