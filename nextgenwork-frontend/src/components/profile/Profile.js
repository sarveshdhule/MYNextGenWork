import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Box, Alert, Paper, Tabs, Tab, Avatar, Divider, List, ListItem, ListItemText, ListItemAvatar, IconButton } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import MyRequests from './MyRequests';
import MyPostedOpportunities from './MyPostedOpportunities';
import MyRegistrations from '../opportunities/MyRegistrations';
import Notifications from '../notifications/Notifications';
import ResourceDetails from '../resources/ResourceDetails';
import MyPostedResources from '../resources/MyPostedResources';

const Profile = () => {
  const { token, user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(user || {});
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const [resourceBookmarks, setResourceBookmarks] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceDetailsOpen, setResourceDetailsOpen] = useState(false);
  const [postedResourcesOpen, setPostedResourcesOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
        setProfile(data);
        setForm({ username: data.username, email: data.email, password: '' });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      setProfile(data.user);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchBookmarks = async () => {
    setLoadingBookmarks(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBookmarks(data);
    } catch (err) {
      setError('Failed to fetch bookmarks');
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const handleUnbookmark = async (opportunityId) => {
    try {
      await fetch(`http://localhost:5000/api/users/bookmark/${opportunityId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(bookmarks.filter(b => b._id !== opportunityId));
    } catch (err) {
      setError('Failed to unbookmark');
    }
  };

  const fetchResourceBookmarks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/resource-bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setResourceBookmarks(Array.isArray(data) ? data : []);
    } catch (err) {
      setResourceBookmarks([]);
    }
  };

  const handleUnbookmarkResource = async (resourceId) => {
    try {
      await fetch(`http://localhost:5000/api/users/bookmark-resource/${resourceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setResourceBookmarks(resourceBookmarks.filter(r => r._id !== resourceId));
    } catch (err) {
      // Optionally show error
    }
  };

  // Fetch bookmarks only when the tab is switched to Bookmarks
  React.useEffect(() => {
    if (tab === 1) fetchBookmarks();
    if (tab === 1) fetchResourceBookmarks();
    // eslint-disable-next-line
  }, [tab]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile || !profile.username) return <Typography>Loading...</Typography>;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="90vh" sx={{
      background: 'linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)',
      py: 6,
      px: 2,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glassmorphism Card */}
      <Paper elevation={12} sx={{
        p: 0,
        width: { xs: '100vw', sm: 600, md: 900, lg: 1100, xl: 1300 },
        maxWidth: { xs: 420, sm: 600, md: 900, lg: 1100, xl: 1300 },
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: '0 8px 40px #0002',
        backdropFilter: 'blur(12px)',
        background: 'rgba(255,255,255,0.85)',
        position: 'relative',
      }}>
        {/* Gradient Header with Avatar */}
        <Box sx={{
          background: 'linear-gradient(90deg, #1976d2 0%, #0288d1 100%)',
          color: 'white',
          p: { xs: 1, sm: 2, md: 4, lg: 6 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 2, md: 3, lg: 5 },
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' },
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: '0 4px 24px #0003',
        }}>
          <Avatar sx={{ width: { xs: 48, sm: 56, md: 80, lg: 100 }, height: { xs: 48, sm: 56, md: 80, lg: 100 }, bgcolor: 'secondary.main', fontSize: { xs: 22, sm: 28, md: 40, lg: 52 }, boxShadow: '0 2px 12px #0004', border: '4px solid #fff', mb: { xs: 1, sm: 0 } }}>
            {profile.username ? profile.username[0].toUpperCase() : '?'}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={900} letterSpacing={1} sx={{ textShadow: '0 2px 12px #0005', fontSize: { xs: 18, sm: 22, md: 32, lg: 40 } }}>{profile.username || 'User'}</Typography>
            <Typography variant="body1" sx={{ opacity: 0.95, fontSize: { xs: 12, sm: 14, md: 18, lg: 22 } }}>{profile.email}</Typography>
          </Box>
          <Box flex={1} />
          <IconButton color="inherit" onClick={() => { logout(); navigate('/login'); }} title="Logout" sx={{ bgcolor: 'rgba(255,255,255,0.12)', mt: { xs: 1, sm: 0 } }}>
            <LogoutIcon fontSize="large" />
          </IconButton>
        </Box>
        {/* Tile navigation - enhanced glassy, centered, 3D effect */}
        <Box sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          background: 'rgba(245,246,250,0.95)',
          borderBottom: 1,
          borderColor: 'divider',
          py: { xs: 1, sm: 2, md: 3, lg: 4 },
        }}>
          {/* Glassy blur background behind tiles */}
          <Box sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 220, sm: 320, md: 540, lg: 700 },
            height: { xs: 120, sm: 180, md: 120, lg: 120 },
            zIndex: 0,
            borderRadius: 6,
            background: 'rgba(255,255,255,0.35)',
            boxShadow: '0 8px 32px #0288d122',
            backdropFilter: 'blur(18px)',
            filter: 'blur(2px)',
          }} />
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: { xs: 1, sm: 2, md: 3, lg: 4 },
            zIndex: 1,
            width: '100%',
            px: { xs: 1, sm: 0 },
          }}>
            {[
              { label: 'Profile Info', icon: <EditIcon color={tab === 0 ? 'primary' : 'action'} sx={{ fontSize: 24 }} />, idx: 0 },
              { label: 'Bookmarks', icon: <BookmarkIcon color={tab === 1 ? 'primary' : 'action'} sx={{ fontSize: 24 }} />, idx: 1 },
              { label: 'My Posted Opportunities', icon: <Avatar sx={{ width: 26, height: 26, bgcolor: tab === 2 ? 'primary.main' : 'grey.200', color: tab === 2 ? 'white' : 'primary.main', fontSize: 13, fontWeight: 700, boxShadow: tab === 2 ? '0 2px 12px #0288d1' : '0 1px 4px #0001' }}>PO</Avatar>, idx: 2 },
              { label: 'My Posted Resources', icon: <Avatar sx={{ width: 26, height: 26, bgcolor: postedResourcesOpen ? 'primary.main' : 'grey.200', color: postedResourcesOpen ? 'white' : 'primary.main', fontSize: 13, fontWeight: 700, boxShadow: postedResourcesOpen ? '0 2px 12px #0288d1' : '0 1px 4px #0001' }}>PR</Avatar>, idx: 'pr' },
              { label: 'My Job Requests', icon: <Avatar sx={{ width: 26, height: 26, bgcolor: tab === 3 ? 'primary.main' : 'grey.200', color: tab === 3 ? 'white' : 'primary.main', fontSize: 13, fontWeight: 700, boxShadow: tab === 3 ? '0 2px 12px #0288d1' : '0 1px 4px #0001' }}>JR</Avatar>, idx: 3 },
              { label: 'My Registrations', icon: <Avatar sx={{ width: 26, height: 26, bgcolor: tab === 4 ? 'primary.main' : 'grey.200', color: tab === 4 ? 'white' : 'primary.main', fontSize: 13, fontWeight: 700, boxShadow: tab === 4 ? '0 2px 12px #0288d1' : '0 1px 4px #0001' }}>MR</Avatar>, idx: 4 },
              { label: 'Notifications', icon: <Avatar sx={{ width: 26, height: 26, bgcolor: tab === 5 ? 'primary.main' : 'grey.200', color: tab === 5 ? 'white' : 'primary.main', fontSize: 13, fontWeight: 700, boxShadow: tab === 5 ? '0 2px 12px #0288d1' : '0 1px 4px #0001' }}>N</Avatar>, idx: 5 },
            ].map(tile => (
              <Box
                key={tile.idx}
                onClick={() => {
                  if (tile.idx === 'pr') {
                    setTab('pr');
                    setPostedResourcesOpen(true);
                  } else setTab(tile.idx);
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  borderRadius: 4,
                  minHeight: 90,
                  minWidth: 75,
                  background: (tab === tile.idx || (tile.idx === 'pr' && postedResourcesOpen))
                    ? 'linear-gradient(120deg, #1976d2 0%, #0288d1 100%)'
                    : 'rgba(255,255,255,0.75)',
                  color: (tab === tile.idx || (tile.idx === 'pr' && postedResourcesOpen)) ? 'white' : 'primary.main',
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: 1,
                  cursor: 'pointer',
                  border: (tab === tile.idx || (tile.idx === 'pr' && postedResourcesOpen)) ? '2.5px solid #0288d1' : '2.5px solid transparent',
                  boxShadow: (tab === tile.idx || (tile.idx === 'pr' && postedResourcesOpen))
                    ? '0 8px 32px #0288d155, 0 0 0 4px #0288d144'
                    : '0 2px 8px #0288d122',
                  transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
                  position: 'relative',
                  zIndex: 2,
                  '&:hover': {
                    transform: 'scale(1.07) translateY(-2px)',
                    boxShadow: '0 12px 36px #0288d188, 0 0 0 6px #0288d122',
                    background: 'linear-gradient(120deg, #1976d2 0%, #0288d1 100%)',
                    color: 'white',
                  },
                }}
              >
                {tile.icon}
                <Typography mt={1.2} fontWeight={800} fontSize={16} align="center" sx={{ textShadow: (tab === tile.idx || (tile.idx === 'pr' && postedResourcesOpen)) ? '0 2px 8px #0005' : 'none' }}>{tile.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        {/* Main Content Area */}
        <Box sx={{ p: 4, minHeight: 370, background: 'rgba(255,255,255,0.92)', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          {tab === 0 && (
            <Box>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {!editing ? (
                <>
                  <Typography variant="subtitle1" mb={1}><strong>Username:</strong> {profile.username}</Typography>
                  <Typography variant="subtitle1" mb={2}><strong>Email:</strong> {profile.email}</Typography>
                  <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditing(true)} sx={{ mr: 2 }}>Edit Profile</Button>
                  <Button variant="outlined" onClick={() => navigate('/')} sx={{ mr: 2 }}>Back</Button>
                </>
              ) : (
                <form onSubmit={handleUpdate} style={{ marginTop: 8 }}>
                  <TextField
                    name="username"
                    label="Username"
                    value={form.username}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    name="password"
                    label="New Password (leave blank to keep current)"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                  />
                  <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, mr: 1 }}>Save</Button>
                  <Button type="button" variant="outlined" onClick={() => setEditing(false)} sx={{ mt: 2 }}>Cancel</Button>
                </form>
              )}
            </Box>
          )}
          {tab === 1 && (
            <Box>
              <Typography variant="h6" mb={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <BookmarkIcon sx={{ mr: 1 }} /> Bookmarks
              </Typography>
              {/* Bookmarked Resources */}
              <Typography variant="subtitle1" mt={2} mb={1}>Bookmarked Resources</Typography>
              {resourceBookmarks.length === 0 ? (
                <Typography color="text.secondary">You haven't bookmarked any resources yet.</Typography>
              ) : (
                <List>
                  {resourceBookmarks.map(r => (
                    <ListItem key={r._id} alignItems="flex-start" secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleUnbookmarkResource(r._id)}>
                        <DeleteIcon />
                      </IconButton>
                    }>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.light' }}>{r.title ? r.title[0].toUpperCase() : '?'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<span style={{ cursor: 'pointer', color: '#0288d1' }} onClick={() => { setSelectedResource(r); setResourceDetailsOpen(true); }}>{r.title}</span>}
                        secondary={r.description}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Divider sx={{ my: 2 }} />
              {/* Bookmarked Opportunities (existing) */}
              <Typography variant="subtitle1" mt={2} mb={1}>Bookmarked Opportunities</Typography>
              {loadingBookmarks ? (
                <Typography>Loading...</Typography>
              ) : (Array.isArray(bookmarks) && bookmarks.length === 0) ? (
                <Typography color="text.secondary">You haven't bookmarked any opportunities yet.</Typography>
              ) : (
                <List>
                  {(Array.isArray(bookmarks) ? bookmarks : []).map(b => (
                    <ListItem key={b._id} alignItems="flex-start" secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleUnbookmark(b._id)}>
                        <DeleteIcon />
                      </IconButton>
                    }>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>{b.title ? b.title[0].toUpperCase() : '?'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<span style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => navigate(`/opportunity/${b._id}`)}>{b.title}</span>}
                        secondary={b.description}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <ResourceDetails open={resourceDetailsOpen} onClose={() => setResourceDetailsOpen(false)} resource={selectedResource} user={user} isOwner={selectedResource && user && String(selectedResource.userId) === String(user._id)} />
            </Box>
          )}
          {tab === 2 && (
            <MyPostedOpportunities />
          )}
          {tab === 'pr' && (
            <MyPostedResources open={postedResourcesOpen} onClose={() => { setPostedResourcesOpen(false); setTab(0); }} user={user} />
          )}
          {tab === 3 && (
            <MyRequests />
          )}
          {tab === 4 && (
            <MyRegistrations />
          )}
          {tab === 5 && (
            <Notifications />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
