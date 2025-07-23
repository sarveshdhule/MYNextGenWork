import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Stack } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const MyRequests = () => {
  const { token } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, requestId: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/requests/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch requests');
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete request');
      }
      setRequests(requests.filter(req => req._id !== requestId));
      setDeleteDialog({ open: false, requestId: null });
      // Optionally show a toast
    } catch (err) {
      // Optionally show a toast
    }
  };

  const openDeleteDialog = (requestId) => {
    setDeleteDialog({ open: true, requestId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, requestId: null });
  };

  const getLogoUrl = (opportunity) => {
    if (opportunity && opportunity.logo) {
      return `http://localhost:5000/${opportunity.logo.replace(/\\/g, '/')}`;
    }
    return '/default-logo.png';
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {requests.length === 0 ? (
        <Typography color="text.secondary">You haven't made any job requests yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {requests.map((req) => (
            <Paper key={req._id} elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6, bgcolor: '#f5faff' } }} onClick={() => navigate(`/opportunity/${req.opportunity?._id}`)}>
              <Avatar src={getLogoUrl(req.opportunity)} sx={{ width: 48, height: 48, mr: 2 }} />
              <Box flex={1}>
                <Typography variant="h6" color="primary.main">{req.opportunity?.title}</Typography>
                <Typography variant="body2" color="text.secondary" mb={0.5}>{req.opportunity?.description}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Domain: {req.opportunity?.domain} | Date: {req.opportunity?.date?.slice(0, 10)}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  <strong>Your Request:</strong> {req.description}
                </Typography>
                {req.resumePath && (
                  <Button
                    variant="outlined"
                    size="small"
                    href={`http://localhost:5000/${req.resumePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 1 }}
                    onClick={e => e.stopPropagation()}
                  >
                    Download Resume
                  </Button>
                )}
              </Box>
              <Button variant="outlined" color="error" size="small" sx={{ ml: 2 }} onClick={e => { e.stopPropagation(); openDeleteDialog(req._id); }}>Delete</Button>
            </Paper>
          ))}
        </Stack>
      )}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this job request? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button 
            onClick={() => handleDeleteRequest(deleteDialog.requestId)} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyRequests;