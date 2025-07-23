import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Box, Typography, Paper, CircularProgress, Badge, IconButton, List, ListItem, ListItemText, ListItemAvatar, Avatar, Stack } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import ResourceDetails from '../resources/ResourceDetails';

const typeIcon = (type) => {
  if (type === 'job') return <WorkIcon color="primary" />;
  if (type === 'contest') return <EmojiEventsIcon color="secondary" />;
  if (type === 'webinar') return <EventNoteIcon color="action" />;
  return <NotificationsIcon color="action" />;
};

const Notifications = () => {
  const { token, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Fetch resource details by ID
  const openResourceDetails = async (resourceId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/resources`);
      const all = await res.json();
      const found = all.find(r => r._id === resourceId);
      if (found) {
        setSelectedResource(found);
        setResourceModalOpen(true);
      }
    } catch (err) {
      // fallback: open with notification resource data
      setSelectedResource(notifications.find(n => n.resource && n.resource._id === resourceId)?.resource);
      setResourceModalOpen(true);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const handleMarkAsReadAndRemove = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      // ignore
    }
  };

  const unreadCount = notifications.filter(n => !(n.readBy || []).includes(user._id)).length;
  const unreadNotifications = notifications.filter(n => !(n.readBy || []).includes(user._id));

  return (
    <Box mt={4}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon color="primary" fontSize="large" />
        </Badge>
        <Typography variant="h6" fontWeight={600}>Notifications</Typography>
      </Stack>
      {loading ? <CircularProgress /> : error ? (
        <Typography color="error">{error}</Typography>
      ) : unreadNotifications.length === 0 ? (
        <Typography color="text.secondary">No notifications yet.</Typography>
      ) : (
        <List>
          {unreadNotifications.map(n => {
            const isRead = (n.readBy || []).includes(user._id);
            const isResource = !!n.resource;
            return (
              <ListItem
                key={n._id}
                sx={{ bgcolor: isRead ? '#f5f5f5' : '#e3f2fd', borderRadius: 2, mb: 1, cursor: (n.opportunity || isResource) ? 'pointer' : 'default', position: 'relative' }}
                onClick={() => {
                  if (n.opportunity) navigate(`/opportunity/${n.opportunity._id}`);
                  if (isResource && n.resource && n.resource._id) {
                    openResourceDetails(n.resource._id);
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    {isResource ? <NotificationsIcon color="secondary" /> : typeIcon(n.opportunity?.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={n.message}
                  secondary={n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                />
                {!isRead && (
                  <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      edge="end"
                      aria-label="mark as read"
                      onClick={e => {
                        e.stopPropagation();
                        handleMarkAsReadAndRemove(n._id);
                      }}
                      size="large"
                    >
                      <CheckIcon color="success" fontSize="large" />
                    </IconButton>
                  </Box>
                )}
              </ListItem>
            );
          })}
        </List>
      )}
      <ResourceDetails open={resourceModalOpen} onClose={() => setResourceModalOpen(false)} resource={selectedResource} user={user} isOwner={selectedResource && user && String(selectedResource.userId) === String(user._id)} />
    </Box>
  );
};

export default Notifications; 