import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Box, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ResourceDetails from './ResourceDetails';

const MyPostedResources = ({ open, onClose, user }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('http://localhost:5000/api/resources/mine', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => { setResources(data); setLoading(false); })
      .catch(() => { setError('Failed to fetch resources'); setLoading(false); });
  }, [open]);

  const handleResourceChange = () => {
    setSelectedResource(null);
    // Refetch the user's resources
    setLoading(true);
    fetch('http://localhost:5000/api/resources/mine', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => { setResources(data); setLoading(false); })
      .catch(() => { setError('Failed to fetch resources'); setLoading(false); });
  };

  const handleCloseAndRefresh = () => {
    setSelectedResource(null);
    setLoading(true);
    fetch('http://localhost:5000/api/resources/mine', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => { setResources(data); setLoading(false); })
      .catch(() => { setError('Failed to fetch resources'); setLoading(false); });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>My Posted Resources</span>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? <CircularProgress /> : error ? (
          <Typography color="error">{error}</Typography>
        ) : resources.length === 0 ? (
          <Typography color="text.secondary">You haven't posted any resources yet.</Typography>
        ) : (
          <List>
            {resources.map(r => (
              <ListItem key={r._id} alignItems="flex-start" button onClick={() => setSelectedResource(r)}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{r.title ? r.title[0].toUpperCase() : '?'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<span style={{ color: '#1976d2', fontWeight: 700 }}>{r.title}</span>}
                  secondary={r.description}
                />
              </ListItem>
            ))}
          </List>
        )}
        <ResourceDetails
          open={!!selectedResource}
          onClose={handleCloseAndRefresh}
          resource={selectedResource}
          user={user}
          isOwner={selectedResource && user && String(selectedResource.userId) === String(user._id)}
          setResources={setResources}
          onResourceChange={handleCloseAndRefresh}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MyPostedResources; 