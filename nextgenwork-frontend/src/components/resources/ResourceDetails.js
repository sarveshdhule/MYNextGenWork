import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Stack, Chip, Box, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Rating from '@mui/material/Rating';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ResourceComments from './ResourceComments';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ResourceForm from './ResourceForm';

const ResourceDetails = ({ open, onClose, resource, user, onRate, isOwner, setResources, onResourceChange }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!resource) return;
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    setDeleting(true);
    await fetch(`http://localhost:5000/api/resources/${resource._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setDeleting(false);
    onClose();
    if (setResources) {
      const res2 = await fetch('http://localhost:5000/api/resources');
      const all = await res2.json();
      setResources(all);
    }
    if (onResourceChange) onResourceChange();
  };

  if (!resource) return null;
  const avgRating = resource.ratings && resource.ratings.length > 0
    ? (resource.ratings.reduce((acc, r) => acc + r.rating, 0) / resource.ratings.length)
    : 0;
  const userRating = resource.ratings && user ? (resource.ratings.find(r => r.userId === user._id || r.userId === String(user._id))?.rating || null) : null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Resource Details</span>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>{resource.title}</Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>{resource.description}</Typography>
          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
            <Chip label={resource.domain} color="primary" size="small" />
            {resource.tags && resource.tags.map(tag => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Stack>
          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
            {resource.resourceLinks && resource.resourceLinks.map(rl => (
              <Chip
                key={rl.type}
                label={rl.type}
                color="secondary"
                clickable
                component="a"
                href={rl.link}
                target="_blank"
                rel="noopener"
                sx={{ fontWeight: 600 }}
                icon={<OpenInNewIcon fontSize="small" />}
              />
            ))}
          </Stack>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating
              name={`resource-rating-details-${resource._id}`}
              value={userRating || avgRating}
              precision={0.5}
              readOnly={isOwner || !user || !onRate}
              onChange={(e, newValue) => {
                if (onRate && newValue) onRate(resource._id, newValue);
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {resource.ratings && resource.ratings.length > 0
                ? `${avgRating.toFixed(1)} (${resource.ratings.length})`
                : 'No ratings'}
            </Typography>
          </Box>
          {isOwner && (
            <Stack direction="row" spacing={2} mb={2}>
              <Button variant="outlined" color="info" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                Edit
              </Button>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </Stack>
          )}
          <ResourceComments resourceId={resource._id} user={user} />
        </DialogContent>
      </Dialog>
      {isOwner && (
        <ResourceForm
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            if (onResourceChange) onResourceChange();
          }}
          setResources={setResources}
          editResource={resource}
        />
      )}
    </>
  );
};

export default ResourceDetails; 