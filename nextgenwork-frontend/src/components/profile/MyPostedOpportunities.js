import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Box, Typography, Paper, Button, Alert, Avatar, Stack } from '@mui/material';

const MyPostedOpportunities = () => {
  const { token } = useContext(AuthContext);
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/my-opportunities', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch');
        setOpportunities(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOpportunities();
  }, [token]);

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {opportunities.length === 0 ? (
        <Typography color="text.secondary">You haven't posted any opportunities yet.</Typography>
      ) : (
        <Stack spacing={3}>
          {opportunities.map(opp => (
            <Paper key={opp._id} elevation={8} sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.85)',
              boxShadow: '0 4px 24px #0288d133',
              transition: 'all 0.25s',
              '&:hover': {
                boxShadow: '0 8px 32px #0288d155',
                background: 'rgba(2,136,209,0.08)',
                transform: 'translateY(-2px) scale(1.02)',
              },
            }} onClick={() => navigate(`/opportunity/${opp._id}`)}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 3, width: 56, height: 56, fontSize: 28, boxShadow: '0 2px 8px #0288d122' }}>{opp.title ? opp.title[0].toUpperCase() : '?'}</Avatar>
              <Box flex={1}>
                <Typography variant="h5" color="primary.main" fontWeight={800} letterSpacing={1}>{opp.title}</Typography>
                <Typography variant="body1" color="text.secondary" mb={0.5}>{opp.description}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Domain: {opp.domain} | Date: {opp.date?.slice(0, 10)}
                </Typography>
              </Box>
              <Button variant="contained" size="small" sx={{ ml: 2, fontWeight: 700, letterSpacing: 1 }} onClick={e => { e.stopPropagation(); navigate(`/opportunity/${opp._id}`); }}>View Details</Button>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default MyPostedOpportunities; 