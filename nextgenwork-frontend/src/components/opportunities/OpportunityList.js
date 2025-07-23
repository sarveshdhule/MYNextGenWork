import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Alert, MenuItem, Select, InputLabel, FormControl, IconButton } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';

const OpportunityList = () => {
  const { token, logout, user } = useContext(AuthContext);
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [type, setType] = useState('');
  const [thirdField, setThirdField] = useState('');
  const navigate = useNavigate();

  // Dynamic label for third filter
  const getThirdFieldLabel = () => {
    if (type === 'contest') return 'Organizer';
    if (type === 'webinar') return 'Speaker';
    return 'Company Name';
  };

  useEffect(() => {
    setThirdField(''); // Reset third field when type changes
  }, [type]);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        let url = 'http://localhost:5000/api/opportunities?';
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (domain) url += `domain=${encodeURIComponent(domain)}&`;
        if (type) url += `type=${encodeURIComponent(type)}&`;
        // Use correct param for third field
        if (thirdField) {
          if (type === 'contest') url += `organizer=${encodeURIComponent(thirdField)}&`;
          else if (type === 'webinar') url += `speaker=${encodeURIComponent(thirdField)}&`;
          else url += `companyName=${encodeURIComponent(thirdField)}&`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch');
        setOpportunities(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOpportunities();
  }, [search, domain, type, thirdField]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBookmark = async (opportunityId) => {
    try {
      await fetch(`http://localhost:5000/api/users/bookmark/${opportunityId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Bookmarked!');
    } catch (err) {
      alert('Failed to bookmark');
    }
  };

  const handleDeleteOpportunity = async (opportunityId) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await fetch(`http://localhost:5000/api/opportunities/${opportunityId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpportunities(opportunities.filter(o => o._id !== opportunityId));
    } catch (err) {
      alert('Failed to delete opportunity');
    }
  };

  // Helper to get logo URL or default
  const getLogoUrl = (opp) => {
    if (opp && opp.logo) {
      const filename = opp.logo.split(/[/\\]/).pop();
      return `http://localhost:5000/public/logos/${filename}`;
    }
    return '/public/pics/codelogo.png';
  };

  const typeColor = {
    job: '#1976d2',
    contest: '#ff9800',
    webinar: '#43a047',
  };
  const typeIcon = (type) => {
    if (type === 'job') return <WorkIcon sx={{ color: typeColor.job, fontSize: 28, mr: 1 }} />;
    if (type === 'contest') return <EmojiEventsIcon sx={{ color: typeColor.contest, fontSize: 28, mr: 1 }} />;
    if (type === 'webinar') return <LiveTvIcon sx={{ color: typeColor.webinar, fontSize: 28, mr: 1 }} />;
    return null;
  };

  // Helper to get status tag for contests and webinars
  const getStatusTag = (opp) => {
    let eventDate = null;
    if (opp.type === 'contest' && opp.contestDateTime) {
      eventDate = new Date(opp.contestDateTime);
    } else if (opp.type === 'webinar' && opp.webinarDateTime) {
      eventDate = new Date(opp.webinarDateTime);
    } else if (opp.type === 'job' && opp.applicationDeadline) {
      eventDate = new Date(opp.applicationDeadline);
    }
    if (eventDate && eventDate < new Date()) {
      return (
        <Box component="span" sx={{
          display: 'inline-block',
          background: 'linear-gradient(90deg, #e57373 0%, #ffb199 100%)',
          color: 'white',
          borderRadius: 2,
          px: 1.5,
          py: 0.2,
          fontSize: 13,
          fontWeight: 700,
          ml: 2,
          boxShadow: '0 2px 8px #e5737333',
          letterSpacing: 1,
        }}>
          {opp.type === 'contest' ? 'Completed' : 'Expired'}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      py: 6
    }}>
      {/* BG Image for listing (fixed, full screen) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          minHeight: '100vh',
          minWidth: '100vw',
          width: '100vw',
          height: '100vh',
          background: `url('http://localhost:5000/public/pics/job2.jpg') center center/cover no-repeat fixed`,
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
      <Box display="flex" flexDirection="column" alignItems="center" mt={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            maxWidth: { xs: '100vw', sm: 600, md: 900, lg: 1100 },
            width: '100%',
            mx: 'auto',
            mt: -3,
            mb: { xs: 1, sm: 2, md: 4 },
            px: { xs: 0.5, sm: 2, md: 4 },
            py: { xs: 1, sm: 2, md: 3 },
            borderRadius: 6,
            boxShadow: '0 8px 40px #0288d122',
            background: 'rgba(255,255,255,0.92)',
            position: 'relative',
          }}
        >
          {/* Modern header and subtitle */}
          <Box sx={{ textAlign: 'center', mb: 2, mt: 0 }}>
            <Typography variant="h3" fontWeight={900} letterSpacing={1} color="#1976d2" sx={{ textShadow: '0 2px 12px #0288d144', mb: 0.5 }}>
              Opportunities
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
              "Opportunities don't happen, you create them. Find your next big break here!"
            </Typography>
            <Box sx={{ width: 120, mx: 'auto', my: 1 }}>
              <Box sx={{ height: 4, borderRadius: 2, background: 'linear-gradient(90deg, #1976d2 0%, #0288d1 100%)' }} />
            </Box>
          </Box>
        {/* Filter/Search Bar Card */}
          <Paper elevation={6} sx={{
            mb: 4,
            px: { xs: 2, sm: 4 },
            py: 3,
            borderRadius: 4,
            boxShadow: '0 4px 24px #0002',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
          }}>
          <TextField
            label="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 140 }}
          />
          <TextField
            label="Domain"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          />
          <TextField
            label={getThirdFieldLabel()}
            value={thirdField}
            onChange={e => setThirdField(e.target.value)}
            size="small"
            sx={{ minWidth: 140 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={e => setType(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="job">Job</MenuItem>
              <MenuItem value="contest">Contest</MenuItem>
              <MenuItem value="webinar">Webinar</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={() => navigate('/add')} sx={{ ml: 1 }}>Add Opportunity</Button>
        </Paper>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ width: '100%', maxWidth: { xs: '100vw', sm: 600, md: 900, lg: 1100 } }}>
          {opportunities.map(opp => {
            const isPoster = opp.postedBy?._id?.toString() === user._id?.toString();
            return (
              <Paper key={opp._id} elevation={8} sx={{
                  p: { xs: 1, sm: 2, md: 3 },
                  mb: { xs: 2, sm: 3, md: 4 },
                borderRadius: 5,
                display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                boxShadow: '0 8px 32px #0288d144',
                background: 'rgba(255,255,255,0.92)',
                  borderLeft: { xs: '6px solid ' + typeColor[opp.type], sm: '10px solid ' + typeColor[opp.type] },
                transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
                '&:hover': {
                  boxShadow: '0 16px 48px #0288d188',
                    transform: { xs: 'none', sm: 'scale(1.025) translateY(-2px)' },
                  background: 'rgba(245,250,255,0.98)',
                },
                position: 'relative',
              }}>
                {/* Logo */}
                <Box sx={{
                    minWidth: { xs: 56, sm: 96 },
                    minHeight: { xs: 56, sm: 96 },
                    width: { xs: 56, sm: 96 },
                    height: { xs: 56, sm: 96 },
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: `0 4px 24px ${typeColor[opp.type]}33, 0 0 0 4px #fff` ,
                  border: `4px solid ${typeColor[opp.type]}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                    mr: { xs: 0, sm: 4 },
                    mb: { xs: 2, sm: 0 },
                  background: '#f5faff',
                }}>
                  <img
                    src={getLogoUrl(opp)}
                    alt="Company Logo"
                    style={{ width: '90%', height: '90%', objectFit: 'cover', borderRadius: '50%' }}
                    onError={e => {
                      // Prevent infinite loop: only set fallback if not already set
                      if (!e.target.dataset.fallback) {
                        e.target.onerror = null;
                        e.target.src = '/public/pics/codelogo.png';
                        e.target.dataset.fallback = 'true';
                      }
                    }}
                  />
                </Box>
                {/* Main Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    {typeIcon(opp.type)}
                    <Typography variant="h5" fontWeight={900} color={typeColor[opp.type]} sx={{ letterSpacing: 1, mr: 1, cursor: 'pointer', textShadow: '0 2px 8px #0001' }} onClick={() => navigate(`/opportunity/${opp._id}`)}>
                      {opp.title}
                    </Typography>
                    {getStatusTag(opp)}
                  </Box>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={700} mb={0.5} sx={{ fontSize: 17 }}>
                    {opp.type === 'contest'
                      ? (opp.organizer || 'Unknown Organizer')
                      : opp.type === 'webinar'
                        ? (opp.speaker || 'Unknown Speaker')
                        : (opp.companyName || 'N/A')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    {opp.description}
                  </Typography>
                  {/* Salary or Date Highlighted */}
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                    {opp.type === 'job' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', background: '#e3f2fd', color: '#1976d2', fontWeight: 700, fontSize: 16, px: 2, py: 0.5, borderRadius: 2, boxShadow: 1 }}>
                        <MonetizationOnIcon sx={{ mr: 0.5, fontSize: 20 }} />
                        {opp.salary ? `₹${opp.salary}` : 'Salary: N/A'}
                      </Box>
                    )}
                    {/* Application Deadline for jobs */}
                    {opp.type === 'job' && opp.applicationDeadline && (
                      <Box sx={{ display: 'flex', alignItems: 'center', background: '#fffde7', color: '#fbc02d', fontWeight: 700, fontSize: 15, px: 2, py: 0.5, borderRadius: 2, boxShadow: 1 }}>
                        <CalendarMonthIcon sx={{ mr: 0.5, fontSize: 18 }} />
                        Application Deadline: {new Date(opp.applicationDeadline).toLocaleString()}
                      </Box>
                    )}
                    {/* Posted Date and Event Date/Time for webinars and contests */}
                    {opp.type === 'webinar' && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', background: '#e1f5fe', color: '#0288d1', fontWeight: 700, fontSize: 15, px: 2, py: 0.5, borderRadius: 2, boxShadow: 1 }}>
                          <CalendarMonthIcon sx={{ mr: 0.5, fontSize: 18 }} />
                          Posted: {opp.date ? new Date(opp.date).toLocaleDateString() : 'N/A'}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', background: '#f3e5f5', color: '#8e24aa', fontWeight: 700, fontSize: 15, px: 2, py: 0.5, borderRadius: 2, boxShadow: 1 }}>
                          <LiveTvIcon sx={{ mr: 0.5, fontSize: 18 }} />
                          Webinar: {opp.webinarDateTime ? new Date(opp.webinarDateTime).toLocaleString() : 'N/A'}
                        </Box>
                      </>
                    )}
                    {opp.type === 'contest' && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', background: '#fff3e0', color: '#ff9800', fontWeight: 700, fontSize: 15, px: 2, py: 0.5, borderRadius: 2, boxShadow: 1 }}>
                          <CalendarMonthIcon sx={{ mr: 0.5, fontSize: 18 }} />
                          Posted: {opp.date ? new Date(opp.date).toLocaleDateString() : 'N/A'}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', background: '#e8f5e9', color: '#43a047', fontWeight: 700, fontSize: 15, px: 2, py: 0.5, borderRadius: 2, boxShadow: 1 }}>
                          <EmojiEventsIcon sx={{ mr: 0.5, fontSize: 18 }} />
                          Contest: {opp.contestDateTime ? new Date(opp.contestDateTime).toLocaleString() : 'N/A'}
                        </Box>
                      </>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', color: '#616161', fontWeight: 700, fontSize: 15, px: 2, py: 0.5, borderRadius: 2, boxShadow: 1 }}>
                      {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
                      {opp.type === 'job' && ` (${opp.jobType})`}
                    </Box>
                  </Box>
                </Box>
                {/* Actions */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 3, gap: 1, minWidth: 90 }}>
                  <Tooltip title="Bookmark">
                    <IconButton onClick={() => handleBookmark(opp._id)} color="primary" sx={{ bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}>
                      <BookmarkBorderIcon />
                    </IconButton>
                  </Tooltip>
                  {isPoster && (
                    <>
                      {opp.type === 'job' && (
                        <Tooltip title="Edit">
                          <IconButton onClick={() => navigate(`/opportunity/${opp._id}/edit`)} color="info" sx={{ bgcolor: '#e1f5fe', '&:hover': { bgcolor: '#b3e5fc' } }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteOpportunity(opp._id)} color="error" sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Paper>
            );
          })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OpportunityList;





