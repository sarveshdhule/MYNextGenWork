import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Box, Typography, Paper, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MyRegistrations = () => {
  const { token } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/registrations/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch');
        setRegistrations(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchRegistrations();
  }, [token]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" mb={2}>My Registrations</Typography>
      {registrations.length === 0 ? (
        <Typography color="text.secondary">You haven't registered for any contests or webinars yet.</Typography>
      ) : (
        registrations.map((opp) => (
          <Paper key={opp._id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" color="primary.main" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/opportunity/${opp._id}`)}>
              {opp.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Type: {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {opp.type === 'webinar'
                ? `Webinar Date & Time: ${opp.webinarDateTime ? new Date(opp.webinarDateTime).toLocaleString() : 'N/A'}`
                : opp.type === 'contest'
                  ? `Contest Date & Time: ${opp.contestDateTime ? new Date(opp.contestDateTime).toLocaleString() : 'N/A'}`
                  : `Date: ${opp.date?.slice(0, 10) || 'N/A'}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Organizer: {opp.organizer || 'N/A'}
            </Typography>
            {/* Show speaker and platform for webinars */}
            {opp.type === 'webinar' && (
              <>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Speaker: {opp.speaker || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Platform: {opp.platform || 'N/A'}
                </Typography>
              </>
            )}
          </Paper>
        ))
      )}
    </Box>
  );
};

export default MyRegistrations;
