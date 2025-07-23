import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Grid, Button, Fab, TextField, MenuItem, Stack, FormControl, InputLabel, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AuthContext } from '../../context/AuthContext';
import ResourceCard from './ResourceCard';
import ResourceForm from './ResourceForm';
import Rating from '@mui/material/Rating';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const domains = [
  'Web Dev', 'Mobile App Development', 'Computer Science Core', 'DSA', 'Python', 'C++', 'Java',
  'Machine Learning & AI', 'Data Science', 'Cloud Computing', 'DevOps', 'Blockchain Development'
];
const types = ['Blog', 'Playlist', 'Repo', 'Doc'];

const ResourceList = ({ resources, setResources }) => {
  const { token, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [type, setType] = useState('');
  const [bookmarkedResourceIds, setBookmarkedResourceIds] = useState([]);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetch(`http://localhost:5000/api/resources?sort=${sort}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch resources');
        return res.json();
      })
      .then(data => { setResources(data); setLoading(false); })
      .catch(err => {
        setLoading(false);
        setError('Could not load resources. Please check your backend and network.');
        console.error('Failed to fetch resources:', err);
      });
    // Fetch resource bookmarks
    if (token) {
      fetch('http://localhost:5000/api/users/resource-bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setBookmarkedResourceIds(Array.isArray(data) ? data.map(r => r._id) : []);
        })
        .catch(() => setBookmarkedResourceIds([]));
    }
  }, [setResources, token, sort]);

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/resources/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setResources(resources.filter(r => r._id !== id));
  };

  // Add onRate handler
  const handleRate = async (resourceId, rating) => {
    try {
      const res = await fetch(`http://localhost:5000/api/resources/${resourceId}/rate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });
      if (!res.ok) throw new Error('Failed to rate');
      const updated = await res.json();
      setResources(resources.map(r => r._id === resourceId ? updated : r));
    } catch (err) {
      // Optionally show error
      alert('Failed to rate resource.');
    }
  };

  const handleBookmarkResource = async (resourceId, isBookmarked) => {
    try {
      if (isBookmarked) {
        await fetch(`http://localhost:5000/api/users/bookmark-resource/${resourceId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarkedResourceIds(bookmarkedResourceIds.filter(id => id !== resourceId));
      } else {
        await fetch(`http://localhost:5000/api/users/bookmark-resource/${resourceId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarkedResourceIds([...bookmarkedResourceIds, resourceId]);
      }
    } catch (err) {
      alert('Failed to update bookmark');
    }
  };

  // Improved filtering logic
  const filteredResources = resources.filter(resource => {
    const matchesSearch =
      resource.title.toLowerCase().includes(search.toLowerCase()) ||
      (resource.resourceLinks && resource.resourceLinks.some(rl => rl.type.toLowerCase().includes(search.toLowerCase()))) ||
      (resource.description && resource.description.toLowerCase().includes(search.toLowerCase()));
    const matchesDomain = !domain || resource.domain === domain;
    const matchesType = !type || (resource.resourceLinks && resource.resourceLinks.some(rl => rl.type === type));
    return matchesSearch && matchesDomain && matchesType;
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background image (fixed, covers entire screen) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          minHeight: '100vh',
          minWidth: '100vw',
          width: '100vw',
          height: '100vh',
          background: `url('http://localhost:5000/public/pics/learning.webp') center center/cover no-repeat fixed`,
          zIndex: 0,
        }}
      />
      {/* Subtle overlay for readability */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          minHeight: '100vh',
          minWidth: '100vw',
          width: '100vw',
          height: '100vh',
          background: 'rgba(255,255,255,0.18)',
          zIndex: 1,
        }}
      />
      {/* Main content area */}
      <Box
        sx={{
          maxWidth: { xs: '100vw', sm: 600, md: 900, lg: 1100 },
          width: '100%',
          mx: 'auto',
          my: { xs: 1, sm: 2, md: 4 },
          px: { xs: 0.5, sm: 2, md: 3 },
          py: { xs: 1, sm: 2, md: 3 },
          borderRadius: 6,
          boxShadow: '0 8px 40px #0288d122',
          zIndex: 2,
          background: 'rgba(255,255,255,0.92)',
          position: 'relative',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2, pt: 2 }}>
          <Typography variant="h3" fontWeight={900} letterSpacing={1} color="#1976d2" sx={{ textShadow: '0 2px 12px #0288d144', mb: 0.5 }}>
            Learning Hub
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, mb: 2, fontWeight: 500, fontSize: { xs: 11, sm: 13, md: 16, lg: 18 } }}>
            Curated resources for every tech enthusiast. Search, filter, rate, and bookmark your favorites!
          </Typography>
        </Box>
        <Stack 
          direction={{ xs: 'column', sm: 'column', md: 'column', lg: 'row' }} 
          spacing={2} 
          mb={4} 
          justifyContent="center" 
          alignItems="center" 
          sx={{ background: 'rgba(255,255,255,0.85)', borderRadius: 4, boxShadow: '0 2px 12px #0288d122', p: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sort}
              label="Sort By"
              onChange={e => setSort(e.target.value)}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="top-rated">Top Rated</MenuItem>
              <MenuItem value="most-viewed">Most Viewed</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Search by Course Name, Type, or Description"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 240 }}
          />
          <TextField
            select
            label="Domain"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Domains</MenuItem>
            {domains.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="Type"
            value={type}
            onChange={e => setType(e.target.value)}
            size="small"
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All Types</MenuItem>
            {types.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
        </Stack>
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: { xs: 'static', sm: 'static', md: 'static', lg: 'fixed' },
            bottom: 40,
            right: 40,
            zIndex: 2000,
            boxShadow: '0 8px 32px #0288d188',
            width: { xs: '100%', sm: '100%', md: '100%', lg: 56 },
            height: { xs: 48, sm: 48, md: 48, lg: 56 },
            mt: { xs: 2, sm: 2, md: 2, lg: 0 },
            borderRadius: { xs: 2, sm: 2, md: 2, lg: '50%' }
          }}
          onClick={() => setFormOpen(true)}
        >
          <AddIcon sx={{ fontSize: 32 }} />
        </Fab>
        <ResourceForm open={formOpen} onClose={() => setFormOpen(false)} setResources={setResources} />
        {loading && <Typography align="center">Loading...</Typography>}
        {error && <Typography align="center" color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {!loading && !error && filteredResources.length === 0 && (
          <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
            No resources found. Click the + button to add one!
          </Typography>
        )}
        {!loading && !error && filteredResources.length > 0 && (
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mt: 1 }}>
            {filteredResources.map(resource => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={resource._id} sx={{ width: '100%' }}>
                <ResourceCard
                  resource={resource}
                  onDelete={handleDelete}
                  isOwner={user && String(resource.userId) === String(user._id)}
                  user={user}
                  onRate={handleRate}
                  isBookmarked={bookmarkedResourceIds.includes(resource._id)}
                  onBookmark={handleBookmarkResource}
                  onEdit={setResources}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default ResourceList;
