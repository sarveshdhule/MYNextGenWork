import React, { useState } from 'react';
import { Card, CardContent, CardActions, Typography, Chip, IconButton, Tooltip, Stack, Box, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Rating from '@mui/material/Rating';
import ResourceDetails from './ResourceDetails';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EditIcon from '@mui/icons-material/Edit';
import ResourceForm from './ResourceForm';

const ResourceCard = ({ resource, onDelete, isOwner, user, onRate, isBookmarked, onBookmark, onEdit }) => {
  // Find the user's rating if exists
  const userRating = resource.ratings && user ? (resource.ratings.find(r => r.userId === user._id || r.userId === String(user._id))?.rating || null) : null;
  const avgRating = resource.ratings && resource.ratings.length > 0
    ? (resource.ratings.reduce((acc, r) => acc + r.rating, 0) / resource.ratings.length)
    : 0;
  const [hover, setHover] = useState(-1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Domain color mapping for border
  const domainColors = {
    'Web Dev': '#1976d2',
    'Mobile App Development': '#0288d1',
    'Computer Science Core': '#7b1fa2',
    'DSA': '#388e3c',
    'Python': '#fbc02d',
    'C++': '#455a64',
    'Java': '#e64a19',
    'Machine Learning & AI': '#43a047',
    'Data Science': '#0288d1',
    'Cloud Computing': '#00bcd4',
    'DevOps': '#ff9800',
    'Blockchain Development': '#8e24aa',
  };
  const borderColor = domainColors[resource.domain] || '#1976d2';

  return (
    <>
      <Card elevation={8} sx={{
        borderRadius: 4,
        minHeight: { xs: 160, sm: 200, md: 240 },
        maxHeight: { xs: 320, sm: 360 },
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: '0.22s cubic-bezier(.4,2,.6,1)',
        '&:hover': { boxShadow: 12, transform: { xs: 'none', sm: 'scale(1.025) translateY(-2px)' }, background: 'rgba(245,250,255,0.98)' },
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.82)',
        borderLeft: `8px solid ${borderColor}`,
        boxShadow: '0 8px 32px #0288d144',
        position: 'relative',
        backdropFilter: 'blur(6px)',
        m: { xs: 0, sm: 1 },
      }}>
        {/* Floating domain chip - leftmost top corner, flush with border and top */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
          <Chip
            label={resource.domain}
            size="small"
            sx={{
              background: borderColor,
              color: 'white',
              fontWeight: 700,
              boxShadow: '0 2px 8px #0288d122',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              px: 1.5,
              fontSize: { xs: 10, sm: 12 },
            }}
          />
        </Box>
        <CardContent sx={{ flex: 1, overflow: 'hidden', pt: { xs: 2, sm: 3 }, pb: 1 }}>
          {/* Title */}
          <Typography variant="h6" fontWeight={900} gutterBottom noWrap sx={{ letterSpacing: 0.5, mb: 0.5, mt: 1, fontSize: { xs: 15, sm: 18 } }}>
            {resource.title}
          </Typography>
          {/* Description */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500, minHeight: { xs: 24, sm: 36 }, maxHeight: { xs: 32, sm: 48 }, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: { xs: 12, sm: 14 } }}>
            {resource.description}
          </Typography>
          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={1.5}>
              {resource.tags.map(tag => (
                <Chip key={tag} label={tag} size="small" sx={{ bgcolor: '#e3f2fd', fontWeight: 600, fontSize: { xs: 10, sm: 12 } }} />
              ))}
            </Stack>
          )}
          {/* Resource Links */}
          {resource.resourceLinks && resource.resourceLinks.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={1.5}>
              {resource.resourceLinks.map(rl => (
                <Tooltip key={rl.type} title={rl.link}>
                  <Chip
                    label={rl.type}
                    sx={{ fontWeight: 700, bgcolor: '#ede7f6', color: '#512da8', px: 1.5, fontSize: { xs: 10, sm: 12 } }}
                    icon={<OpenInNewIcon fontSize="small" />}
                    clickable
                    component="a"
                    href={rl.link}
                    target="_blank"
                    rel="noopener"
                  />
                </Tooltip>
              ))}
            </Stack>
          )}
          {/* Rating and stats */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 0.5 }}>
            <Rating
              name={`resource-rating-${resource._id}`}
              value={userRating || avgRating}
              precision={0.5}
              readOnly={isOwner || !user || !onRate}
              onChange={(e, newValue) => {
                if (onRate && newValue) onRate(resource._id, newValue);
              }}
              onChangeActive={(e, newHover) => setHover(newHover)}
              sx={{ mr: 1, fontSize: { xs: 16, sm: 20 } }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 11, sm: 13 } }}>
              {resource.ratings && resource.ratings.length > 0
                ? `${avgRating.toFixed(1)} (${resource.ratings.length})`
                : 'No ratings'}
            </Typography>
          </Box>
        </CardContent>
        {/* Actions row */}
        <CardActions sx={{ justifyContent: { xs: 'center', sm: 'flex-end' }, px: 2, pb: 2, pt: 0, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Tooltip title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}>
            <IconButton onClick={() => onBookmark(resource._id, isBookmarked)} color={isBookmarked ? 'primary' : 'default'} sx={{ bgcolor: isBookmarked ? '#e3f2fd' : 'transparent', borderRadius: 2, mx: 0.5 }}>
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
          {isOwner && (
            <Tooltip title="Edit">
              <IconButton color="info" onClick={() => setEditOpen(true)} sx={{ bgcolor: '#e1f5fe', borderRadius: 2, mx: 0.5 }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <Button size="small" onClick={() => setDetailsOpen(true)} variant="contained" sx={{ borderRadius: 2, fontWeight: 700, boxShadow: '0 2px 8px #0288d122', mx: 0.5 }}>View Details</Button>
          {isOwner && (
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => onDelete(resource._id)} sx={{ bgcolor: '#ffebee', borderRadius: 2, mx: 0.5 }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </CardActions>
      </Card>
      <ResourceDetails open={detailsOpen} onClose={() => setDetailsOpen(false)} resource={resource} user={user} onRate={onRate} isOwner={isOwner} />
      {isOwner && (
        <ResourceForm
          open={editOpen}
          onClose={() => setEditOpen(false)}
          setResources={onEdit}
          editResource={resource}
        />
      )}
    </>
  );
};

export default ResourceCard;
