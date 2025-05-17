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
import { Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

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
  const theme = useTheme();

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getDevelopers();
      const developersData = Array.isArray(response.data) ? response.data : [];
      setDevelopers(developersData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch developers');
      console.error('Error fetching developers:', err);
      setDevelopers([]);
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
      setError('');
      if (selectedDeveloper) {
        await updateDeveloper(selectedDeveloper._id, formData);
      } else {
        await createDeveloper(formData);
      }
      handleCloseDialog();
      fetchDevelopers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      console.error('Error saving developer:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this developer? This action cannot be undone.')) {
      try {
        setError('');
        await deleteDeveloper(id);
        fetchDevelopers();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete developer');
        console.error('Error deleting developer:', err);
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
          Developers Management
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
          Add Developer
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
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Website</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {developers.map((developer) => (
              <TableRow key={developer._id}>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {developer.name}
                  </Typography>
                </TableCell>
                <TableCell>{developer.email}</TableCell>
                <TableCell>{developer.company || 'N/A'}</TableCell>
                <TableCell>{developer.phone || 'N/A'}</TableCell>
                <TableCell>
                  {developer.website ? (
                    <Link
                      href={developer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {developer.website}
                    </Link>
                  ) : 'N/A'}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => handleOpenDialog(developer)}
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(developer._id)}
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
          {selectedDeveloper ? 'Edit Developer' : 'Add Developer'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              margin="normal"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              margin="normal"
              sx={{ mb: 2 }}
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
            {selectedDeveloper ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Developers; 